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

        if (this.userCanWrite || UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement+'.'+newFlag.uuid],["write"])) {
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

    dispose(){
        this.flagModel.dispose()
    }        

}