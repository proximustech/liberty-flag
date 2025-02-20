import { IDisposable } from "../../../interfaces/disposable_interface";
import { ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exception_custom_errors";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { TagDataObject,TagDataObjectValidator } from "../dataObjects/TagDataObject";
import { TagModel } from "../models/TagModel";
import { FlagService } from "./FlagService";
import { BucketService } from "./BucketService";

export class TagService implements IDisposable {
    
    private tagModel:TagModel
    private flagService: FlagService;
    private bucketService: BucketService;
    private userPermissions:any
    private serviceSecurityElement:string
    private userCanRead:boolean
    private userCanWrite:boolean

    constructor(tagModel:TagModel,flagService:FlagService,bucketService:BucketService,serviceSecurityElementPrefix:string,userPermissions:any){
        this.tagModel= tagModel
        this.flagService=flagService
        this.bucketService=bucketService
        this.serviceSecurityElement=serviceSecurityElementPrefix+".tag"
        this.userPermissions=userPermissions
        this.userCanRead = UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement],["read"])
        this.userCanWrite = UserHasPermissionOnElement(this.userPermissions,[this.serviceSecurityElement],["write"])
    }

    async create(tag:TagDataObject){
        let roleValidationResult=TagDataObjectValidator.validateFunction(tag,TagDataObjectValidator.validateSchema)

        if (!roleValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,roleValidationResult.messages)
        }        

        if (await this.fieldValueExists(tag.uuid,"name",tag.name)) {
            throw new ExceptionRecordAlreadyExists("Name already exists")
        }  
        
        if (this.userCanWrite) {
            return await this.tagModel.create(tag)            
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }         
    }

    async updateOne(tag:TagDataObject){
        let roleValidationResult=TagDataObjectValidator.validateFunction(tag,TagDataObjectValidator.validateSchema)

        if (!roleValidationResult.isValid) {
            throw new ExceptionInvalidObject(ExceptionInvalidObject.invalidObject,roleValidationResult.messages)
        }        

        if (await this.fieldValueExists(tag.uuid,"name",tag.name)) {
            throw new ExceptionRecordAlreadyExists("Name already exists")
        }  
        
        if (this.userCanWrite) {
            return await this.tagModel.updateOne(tag)            
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }                    
    }

    async deleteByUuId(tagUuId:string){
        if (this.userCanWrite) {
            await this.bucketService.deleteFromTags(tagUuId)
            await this.flagService.deleteFromTags(tagUuId)
            return await this.tagModel.deleteByUuId(tagUuId) 
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }         
    }

    async getByUuId(uuid:string) : Promise<TagDataObject> {

        if (this.userCanRead) {
            return await this.tagModel.getByUuId(uuid)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        }  
    }

    async getAll() : Promise<TagDataObject[]> {
        if (this.userCanRead) {
            return await this.tagModel.getAll()
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }
    
    async fieldValueExists(processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {
        if (this.userCanRead) {
            return await this.tagModel.fieldValueExists(processedDocumentUuid,fieldName,fieldValue)
           
        }
        else{
            throw new ExceptionNotAuthorized(ExceptionNotAuthorized.notAuthorized);            
        } 
    }

    dispose(){
        this.tagModel.dispose()
    }      

    getUuidMapFromList(list:TagDataObject[]) : Map<string, string> {
        //let result:any = {}
        const result = new Map<string, string>();
        list.forEach(tag => {
            //result[tag.name]=tag.uuid
            result.set(tag.uuid,tag.name)
        });

        return result
    }      

}