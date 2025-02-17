import { IDisposable } from "../../../interfaces/disposable_interface";

import { MongoService } from "../services/MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { FlagDataObject } from "../dataObjects/FlagDataObject";
import { Uuid } from "../../../services/utilities";

export class FlagModel implements IDisposable {
    
    private dataBaseName = "lf_plugin"
    private collectionName = "flags"
    private mongoClient:MongoClient
    private mongoService:MongoService
    private dataBase:Db
    private collection:Collection

    constructor(){
        this.mongoService = new MongoService()
        this.mongoClient = this.mongoService.getMongoClient()
        this.dataBase = this.mongoClient.db(this.dataBaseName);
        this.collection = this.dataBase.collection(this.collectionName);
    }

    async create(flag:FlagDataObject){
        flag.uuid = Uuid.createMongoUuId()
        flag._id = new ObjectId(flag.uuid)        
        const result = await this.collection.insertOne(flag,{writeConcern: {w: 1, j: true}})
        if (result.insertedId == flag._id && result.acknowledged) {
            return true
        }
        else return false
        
    }

    async updateOne(flag:FlagDataObject){
        flag._id = new ObjectId(flag.uuid)
        const result = await this.collection.replaceOne(
            {uuid: flag.uuid }, 
            flag,
            {upsert: false,writeConcern: {w: 1, j: true}}
        )

        if (result.acknowledged && result.matchedCount == 1 ) {
            return true
        }
        else return false     
    }

    async deleteByUuId(flagUuId:string){
        const result = await this.collection.deleteOne({ uuid: flagUuId },{writeConcern: {w: 1, j: true}})
        if (result.deletedCount == 1 && result.acknowledged) {
            return true
        }
        else return false
    }
    async deleteByBucketUuId(bucketUuId:string){
        const result = await this.collection.deleteMany({ bucket_uuid: bucketUuId },{writeConcern: {w: 1, j: true}})
        if (result.acknowledged) {
            return true
        }
        else return false
    }

    async getByName(name:string) : Promise<FlagDataObject> {

        const cursor = this.collection.find({name : name});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as FlagDataObject);
            return document
        }

        return new FlagDataObject()
    }

    async getByUuId(uuid:string) : Promise<FlagDataObject> {

        const cursor = this.collection.find({uuid : uuid});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as FlagDataObject);
            return document
        }

        return new FlagDataObject()
    }

    async getAll() : Promise<FlagDataObject[]> {
        const cursor = this.collection.find({});
        return (await cursor.toArray() as FlagDataObject[])
    }

    async getAllByBucketUuid(bucketUuId:string) : Promise<FlagDataObject[]> {
        const cursor = this.collection.find({bucket_uuid: bucketUuId});
        return (await cursor.toArray() as FlagDataObject[])
    }

    async getAllByContextUuid(contextUuId:string) : Promise<FlagDataObject[]> {
        const cursor = this.collection.find({"contexts.bucket_context_uuid": contextUuId});
        return (await cursor.toArray() as FlagDataObject[])
    }        

    async fieldValueExists(processedDocumentBucketUuid:string,processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {
        let filter:any = {}
        filter[fieldName] = String(fieldValue)
        filter["bucket_uuid"] = processedDocumentBucketUuid
        const cursor = this.collection.find(filter);
        while (await cursor.hasNext()) {
            let document:any = await cursor.next();
            if (document.uuid !== processedDocumentUuid) {
                return true
            }
        }
        return false
    }  

    dispose(){
        this.mongoService.dispose()
    }        

}