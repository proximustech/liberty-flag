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

        const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')

        // hasFullWriteAuthority: the user may change the flag's own fields (name, description,
        // tags). Granted by general flag/bucket write or specific-bucket/flag write.
        // It does NOT grant context visibility or editability — those are per-context only.
        const hasFullWriteAuthority =
            this.userCanWrite ||
            //UserHasPermissionOnElement(this.userPermissions,[bucketPrefix],["write"]) ||
            //UserHasPermissionOnElement(this.userPermissions,[bucketPrefix+'.'+newFlag.bucket_uuid],["write"]) ||
            UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement+'.'+newFlag.uuid],["write"])

        // Context writability is determined EXCLUSIVELY by per-context write rules.
        // No flag-level or bucket-level grant ever makes a context writable.
        const perContextWriteUuids:string[] = []
        for (const rule of this.userPermissions) {
            const match = rule[1].match(new RegExp(`^${bucketPrefix.replace(/\./g,'\\.')}[^\\.]+\\.context\\.(.+)$`))
            if (match && rule[2] === 'write') {
                perContextWriteUuids.push(match[1])
            }
        }

        if (!hasFullWriteAuthority && perContextWriteUuids.length === 0) {
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized)
        }

        // Fetch the current DB copy — always needed for the safe merge below
        const oldFlag = await this.flagModel.getByUuId(newFlag.uuid)

        if (!hasFullWriteAuthority) {
            // Non-full-authority users: restore all top-level flag fields from DB
            newFlag.name = oldFlag.name
            newFlag.description = oldFlag.description
            newFlag.tags = oldFlag.tags
            newFlag.bucket_uuid = oldFlag.bucket_uuid
        }

        // Rebuild contexts from DB, applying submitted engine/engine_parameters only for
        // contexts the user has an explicit per-context write rule on.
        
        if (!hasFullWriteAuthority) {
            newFlag.contexts = oldFlag.contexts.map((oldContext:any) => {
    
                if (!perContextWriteUuids.includes(oldContext.bucket_context_uuid)) {
                    return oldContext
                }
    
                const submittedContext = newFlag.contexts.find(
                    (submitted:any) => submitted.bucket_context_uuid === oldContext.bucket_context_uuid
                )
                if (submittedContext) {
                    return {
                        ...oldContext,
                        engine: submittedContext.engine,
                        engine_parameters: submittedContext.engine_parameters,
                    }
                }
    
                // Context is writable but not present in submission — keep DB version
                return oldContext
            })
            
        }

        newFlag=await middlewareTargets["FlagServiceCrudMiddleware"].beforeUpdate(newFlag)
        return await this.flagModel.updateOne(newFlag)

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

        const hasFullWriteAuthority =
            this.userCanWrite ||
            UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement+'.'+flagUuId],["write"])


        if (hasFullWriteAuthority) {
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

        // Allow access if the user has general flag read, a specific bucket permission,
        // or any context-level permission — so partial-write users can look up flags.
        const hasContextLevelAccess = this.userPermissions.some((rule:any) => {
            const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')
            return rule[1].startsWith(bucketPrefix) && rule[1].includes('.context.')
        })

        const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')
        if (this.userCanRead ||
            UserHasPermissionOnElement(this.userPermissions,[bucketPrefix+'.'+bucketUuid],["read","write"]) ||
            hasContextLevelAccess) {
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

        // Allow access if the user has general flag read, a specific flag permission,
        // a specific-bucket permission, or a context-level permission — so users with
        // bucket-scope or context-scope grants can open the flag form.
        const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')
        const hasContextLevelAccess = this.userPermissions.some((rule:any) =>
            rule[1].startsWith(bucketPrefix) && rule[1].includes('.context.')
        )

        // We need the flag's bucket_uuid to check bucket-specific permission.
        // Fetch from DB first, then gate — this avoids a chicken-and-egg problem by
        // letting any of the other checks short-circuit before the DB call.
        if (this.userCanRead ||
            UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement+"."+uuid],["read","write"]) ||
            hasContextLevelAccess) {
            return await this.flagModel.getByUuId(uuid)
        }

        // Bucket-specific check requires the flag's bucket_uuid, so fetch first.
        const flag = await this.flagModel.getByUuId(uuid)
        if (UserHasPermissionOnElement(this.userPermissions,[bucketPrefix+'.'+flag.bucket_uuid],["read","write"])) {
            return flag
        }

        throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized)

    }

    async getAll(filter:any={},limit=0,skip=0) : Promise<FlagDataObject[]> {
        const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')
        const bucketUuidInFilter:string = filter.bucket_uuid || ""
        const hasBucketAccess = bucketUuidInFilter !== "" &&
            UserHasPermissionOnElement(this.userPermissions,[bucketPrefix+'.'+bucketUuidInFilter],["read","write"])
        // Also allow any user who has at least one specific flag or context permission
        const hasAnySpecificAccess = this.userPermissions.some((rule:any) =>
            rule[1].startsWith(this.serviceSecurityElement+'.') ||
            rule[1].startsWith(bucketPrefix)
        )

        if (this.userCanRead || ('uuid' in filter) || hasBucketAccess || hasAnySpecificAccess) {
            return await this.flagModel.getAll(filter,limit,skip)
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }

    async getCount(filter:any={}) : Promise<number> {
        const bucketPrefix = this.serviceSecurityElement.replace('.flag','.bucket.')
        const bucketUuidInFilter:string = filter.bucket_uuid || ""
        const hasBucketAccess = bucketUuidInFilter !== "" &&
            UserHasPermissionOnElement(this.userPermissions,[bucketPrefix+'.'+bucketUuidInFilter],["read","write"])
        const hasAnySpecificAccess = this.userPermissions.some((rule:any) =>
            rule[1].startsWith(this.serviceSecurityElement+'.') ||
            rule[1].startsWith(bucketPrefix)
        )

        if (this.userCanRead || ('uuid' in filter) || hasBucketAccess || hasAnySpecificAccess) {
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