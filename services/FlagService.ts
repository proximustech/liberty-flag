import { IDisposable } from "../../../interfaces/disposable_interface";
import { ExceptionNotAuthorized,ExceptionInvalidObject,ExceptionDataBaseUnExpectedResult } from "../../../types/exceptions";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { FlagDataObject,FlagDataObjectValidator } from "../dataObjects/FlagDataObject";
import { FlagModel } from "../models/FlagModel";
import { exposedMiddlewareTargets as middlewareTargets } from "../values/middlewares"

export class FlagService implements IDisposable {
    
    private flagModel:FlagModel
    private userPermissions:any
    private serviceSecurityElement:string
    private userCanRead:boolean
    private userCanWrite:boolean

    constructor(flagModel:FlagModel,serviceSecurityElementPrefix:string,userPermissions:any){

        this.flagModel= flagModel
        this.serviceSecurityElement=serviceSecurityElementPrefix+".flag"
        this.userPermissions=userPermissions
        this.userCanRead = UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement],["read"])
        this.userCanWrite = UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement],["write"])
        // ?A user with any specific flag or context permission can list/read flags.
        // if (!this.userCanRead) {
        //     this.userCanRead = this.userPermissions.some((rule:any) =>
        //         rule[1].startsWith(this.serviceSecurityElement+'.') ||
        //         rule[1].startsWith(serviceSecurityElementPrefix+'.bucket.')
        //     )
        // }

    }

    async create(flag:FlagDataObject){

        let validationExtraData:any={oldData:false}
        let userValidationResult=FlagDataObjectValidator.validateFunction(flag,FlagDataObjectValidator.validateSchema,FlagDataObjectValidator.extraValidateFunction,validationExtraData)

        if (!userValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,userValidationResult.messages)
        }    

        if (this.userCanWrite) {
            flag=middlewareTargets["FlagServiceCrudMiddleware"].beforeCreate(flag)
            return await this.flagModel.create(flag)            
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }
        
    }

    async updateOne(newFlag:FlagDataObject,oldData:any = false){
        let validationExtraData:any={oldData:false}
        if (oldData === false) {
            validationExtraData.oldData = await this.getByNameAndBucketUuid(newFlag.name,newFlag.bucket_uuid)
        }
        else validationExtraData.oldData = oldData
        let userValidationResult=FlagDataObjectValidator.validateFunction(newFlag,FlagDataObjectValidator.validateSchema,FlagDataObjectValidator.extraValidateFunction,validationExtraData)

        if (!userValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,userValidationResult.messages)
        }

        // General flag write (liberty_flag.flag) is the only permission that allows
        // modifying all contexts without restriction. A specific flag permission
        // (liberty_flag.flag.<uuid>) still requires explicit context access per context.
        const writeOperationApproved = this.userCanWrite || UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement+'.'+newFlag.uuid],["write"])

        // Collect context uuids the user has explicit access to (read or write),
        // combined with any flag write permission, allows saving that context's engine config.
        const oldReadableContextUuids:string[] = []

        for (const rule of this.userPermissions) {
            const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')
            // matches liberty_flag.bucket.<bucketUuid>.context.<contextUuid>
            const match = rule[1].match(new RegExp(`^${bucketPrefix.replace(/\./g,'\\.')}[^\\.]+\\.context\\.(.+)$`))
            if (match && (rule[2]==="read" || rule[2]==="write")) {
                oldReadableContextUuids.push(match[1])
            }
        }


        if (this.userCanWrite || writeOperationApproved) {
            // If the user only has context-level access, rebuild the contexts array
            // entirely from the DB copy, merging only engine/engine_parameters for
            // contexts the user is permitted to access. Every other field, and every
            // context not in the DB, is ignored — even if the attacker submits it.
            if (!this.userCanWrite && oldReadableContextUuids.length > 0) {
                const oldFlag = await this.flagModel.getByUuId(newFlag.uuid)
                newFlag.contexts = oldFlag.contexts.map((oldContext:any) => {

                    // Find the submitted entry for this context by its DB-authoritative uuid
                    const submittedContext = newFlag.contexts.find(
                        submitedFlagContext => submitedFlagContext.bucket_context_uuid === oldContext.bucket_context_uuid
                    )
                    if (submittedContext) {
                        // Only trust engine and engine_parameters from the submission
                        return {
                            ...oldContext,
                            engine: submittedContext.engine,
                            engine_parameters: submittedContext.engine_parameters,
                        }
                    }

                // Not accessible or not submitted — keep DB version untouched
                return oldContext
                })
            }
            newFlag=await middlewareTargets["FlagServiceCrudMiddleware"].beforeUpdate(newFlag)
            return await this.flagModel.updateOne(newFlag)
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }            

    }

    async updateFlagsContextConfig(contextKey:any,flagsContextConfig:any){

        let contextFound = false
        let result = false

        for (let flagsContextConfigIndex = 0; flagsContextConfigIndex < flagsContextConfig.length; flagsContextConfigIndex++) {
            const flagContextConfig = flagsContextConfig[flagsContextConfigIndex];

            let oldFlag = await this.getByNameAndContextKey(flagContextConfig.flag_name,contextKey)
            let newFlag = JSON.parse(JSON.stringify(oldFlag)) as FlagDataObject
            newFlag.contexts.forEach(context => {
                if (context.bucket_context_uuid === contextKey) {
                    contextFound=true
                    context.engine=flagContextConfig.engine
                    context.engine_parameters=flagContextConfig.engine_parameters
                }
            });            

            if (contextFound) {
                let dbResultOk = await this.updateOne(newFlag,oldFlag)
                if (dbResultOk) {
                    result = true                   
                }
                else {
                    throw new ExceptionDataBaseUnExpectedResult(ExceptionDataBaseUnExpectedResult.databaseUnexpectedResult + " setting flag:" + newFlag.name)
                }                             
            } else {
                result = false
            }
        }

        return result    
    }

    async deleteByUuId(flagUuId:string){
        if (this.userCanWrite) {
            middlewareTargets["FlagServiceCrudMiddleware"].beforeDelete(flagUuId)
            return await this.flagModel.deleteByUuId(flagUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }     
    }

    async deleteByBucketUuId(bucketUuId:string){
        if (this.userCanWrite) {
            return await this.flagModel.deleteByBucketUuId(bucketUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }     
    }

    async deleteFromTags(tagUuId:string){
        if (this.userCanWrite) {
            return await this.flagModel.deleteFromTags(tagUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }     
    }
    async deleteFromContexts(contextUuId:string){
        if (this.userCanWrite) {
            return await this.flagModel.deleteFromContexts(contextUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }     
    }

    async getByNameAndBucketUuid(name:string,bucketUuid:string) : Promise<FlagDataObject> {

        if (this.userCanRead || UserHasPermissionOnElement(this.userPermissions,['liberty_flag.bucket.'+bucketUuid],["read","write"])) {
            return await this.flagModel.getByNameAndBucketUuid(name,bucketUuid)

        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }            

    }

    async getByNameAndContextKey(name:string,contextKey:string) : Promise<FlagDataObject> {

        if (this.userCanRead) {
            return await this.flagModel.getByNameAndContextKey(name,contextKey)

        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }            

    }

    async getByUuId(uuid:string) : Promise<FlagDataObject> {

        if (this.userCanRead || UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement+"."+uuid],["read","write"])) {
            return await this.flagModel.getByUuId(uuid)

        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }            

    }

    async getAll(filter:any={},limit=0,skip=0) : Promise<FlagDataObject[]> {
        if (this.userCanRead || ('uuid' in filter)) {
            return await this.flagModel.getAll(filter,limit,skip)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }

    async getCount(filter={}) : Promise<number> {
        if (this.userCanRead || ('uuid' in filter)) {
            return await this.flagModel.getCount(filter)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }        
    }    

    async getAllByBucketUuid(bucketUuId:string) : Promise<FlagDataObject[]> {
        if (this.userCanRead) {
            return await this.flagModel.getAllByBucketUuid(bucketUuId)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }

    async getAllByContextUuid(contextUuId:string) : Promise<FlagDataObject[]> {
        if (this.userCanRead) {
            return await this.flagModel.getAllByContextUuid(contextUuId)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }        

    async fieldValueExists(processedDocumentBucketUuid:string,processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {

        if (this.userCanRead) {
            return await this.flagModel.fieldValueExists(processedDocumentBucketUuid,processedDocumentUuid,fieldName,fieldValue)
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }                    

    }  

    async dispose(): Promise<void> {
        await this.flagModel.dispose()
    }        

}