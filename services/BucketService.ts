import { IDisposable } from "../../../interfaces/disposable_interface";
import { ExceptionNotAuthorized,ExceptionInvalidObject } from "../../../types/exceptions";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { BucketDataObject,BucketContextDataObject,BucketDataObjectValidator} from "../dataObjects/BucketDataObject";
import { BucketModel } from "../models/BucketModel";
import { Uuid } from "../../../services/utilities";
import { FlagService } from "./FlagService";

export class BucketService implements IDisposable {
    
    private bucketModel:BucketModel
    private flagService:FlagService
    private userPermissions:any
    private serviceSecurityElement:string
    private userCanRead:boolean
    private userCanWrite:boolean

    constructor(bucketModel:BucketModel,flagService:FlagService,serviceSecurityElementPrefix:string,userPermissions:any){
        this.bucketModel=bucketModel
        this.flagService=flagService
        this.serviceSecurityElement=serviceSecurityElementPrefix+".bucket"
        this.userPermissions=userPermissions
        this.userCanRead = UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement],["read"])
        this.userCanWrite = UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement],["write"])
    }

    async create(bucket:BucketDataObject){
        let roleValidationResult=BucketDataObjectValidator.validateFunction(bucket,BucketDataObjectValidator.validateSchema,BucketDataObjectValidator.extraValidateFunction)

        if (!roleValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,roleValidationResult.messages)
        }        
        
        if (this.userCanWrite) {
            bucket.contexts.forEach(context => {
                if (context.uuid ==="") {
                    context.uuid = Uuid.createMongoUuId()
                }
                
            });            
            return await this.bucketModel.create(bucket)            
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }          
    }

    async updateOne(bucket:BucketDataObject){
        let roleValidationResult=BucketDataObjectValidator.validateFunction(bucket,BucketDataObjectValidator.validateSchema,BucketDataObjectValidator.extraValidateFunction)

        if (!roleValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,roleValidationResult.messages)
        } 
        
        let oldBucket = await this.getByUuId(bucket.uuid)
        let oldBucketContextUuIds:string[] = []
        oldBucket.contexts.forEach(oldBucketContext => {
            oldBucketContextUuIds.push(oldBucketContext.uuid)
            
        });         

        if (this.userCanWrite) {
            let newBucketContextUuIds:string[] = []
            bucket.contexts.forEach(context => {
                if (context.uuid ==="") {
                    context.uuid = Uuid.createMongoUuId()
                }
                newBucketContextUuIds.push(context.uuid)
            });
            oldBucketContextUuIds.forEach(oldBucketContextUuid => {
                if ( !newBucketContextUuIds.includes(oldBucketContextUuid)) {
                    this.flagService.deleteFromContexts(oldBucketContextUuid)
                }
                
            });        
            return await this.bucketModel.updateOne(bucket)            
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }         
    }

    async deleteByUuId(bucketUuId:string){
        if (this.userCanWrite) {
            if (await this.flagService.deleteByBucketUuId(bucketUuId)) {
                return await this.bucketModel.deleteByUuId(bucketUuId) 
                
            } else return false

        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }             
    }

    async deleteFromTags(tagUuId:string){
        if (this.userCanWrite) {
            return await this.bucketModel.deleteFromTags(tagUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }     
    }    

    async getByUuId(uuid:string) : Promise<BucketDataObject> {

        if (this.userCanRead) {
            return await this.bucketModel.getByUuId(uuid)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }  
    }

    async getAll() : Promise<BucketDataObject[]> {
        if (this.userCanRead) {
            return await this.bucketModel.getAll()
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }
    
    async fieldValueExists(processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {
        if (this.userCanRead) {
            return await this.bucketModel.fieldValueExists(processedDocumentUuid,fieldName,fieldValue)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }

    dispose(){
        this.bucketModel.dispose()
    }      

    public static getUuidMapFromContextsList(list:BucketContextDataObject[]) : Map<string, string> {
        //let result:any = {}
        const result = new Map<string, string>();
        list.forEach(context => {
            //result[context.name]=context.uuid
            result.set(context.uuid,context.name)
        });

        return result
    }
    
    getUuidMapFromList(list:BucketDataObject[]) : Map<string, string> {
        //let result:any = {}
        const result = new Map<string, string>();
        list.forEach(bucket => {
            //result[tag.name]=tag.uuid
            result.set(bucket.uuid,bucket.name)
        });

        return result
    }     

}