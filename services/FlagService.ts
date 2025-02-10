import { IDisposable } from "../../../interfaces/disposable_interface";
import { ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject,ExceptionDataBaseUnExpectedResult } from "../../../types/exception_custom_errors";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { FlagDataObject,FlagDataObjectValidator } from "../dataObjects/FlagDataObject";
import { FlagModel } from "../models/FlagModel";

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

        let userValidationResult=FlagDataObjectValidator.validateFunction(flag,FlagDataObjectValidator.validateSchema)

        if (!userValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,userValidationResult.messages)
        }

        if (await this.fieldValueExists(flag.bucket_uuid,flag.uuid,"name",flag.name)) {
            throw new ExceptionRecordAlreadyExists("Name already exists")
        }        

        if (this.userCanWrite) {
            return await this.flagModel.create(flag)            
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }
        
    }

    async updateOne(newFlag:FlagDataObject,oldFlag:any = false){

        if (oldFlag === false) {
            oldFlag = await this.getByName(newFlag.name)
        }     
        let userValidationResult=FlagDataObjectValidator.validateFunction(newFlag,FlagDataObjectValidator.validateSchema,oldFlag)

        if (!userValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,userValidationResult.messages)
        }
        
        if (await this.fieldValueExists(newFlag.bucket_uuid,newFlag.uuid,"name",newFlag.name)) {
            throw new ExceptionRecordAlreadyExists("Name already exists")
        }  

        if (this.userCanWrite) {
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

            let oldFlag = await this.getByName(flagContextConfig.flag_name)
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
            return await this.flagModel.deleteByUuId(flagUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }     
    }

    async getByName(name:string) : Promise<FlagDataObject> {

        if (this.userCanRead) {
            return await this.flagModel.getByName(name)

        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }            

    }

    async getByUuId(uuid:string) : Promise<FlagDataObject> {

        if (this.userCanRead) {
            return await this.flagModel.getByUuId(uuid)

        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }            

    }

    async getAll() : Promise<FlagDataObject[]> {
        if (this.userCanRead) {
            return await this.flagModel.getAll()
           
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