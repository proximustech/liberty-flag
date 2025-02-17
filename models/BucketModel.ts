import { IDisposable } from "../../../interfaces/disposable_interface";

import { MongoService } from "../services/MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { BucketContextDataObject, BucketDataObject } from "../dataObjects/BucketDataObject";
import { Uuid } from "../../../services/utilities";

export class BucketModel implements IDisposable {
    
    private dataBaseName = "lf_plugin"
    private collectionName = "buckets"
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

    async create(bucket:BucketDataObject){
        bucket.uuid = Uuid.createMongoUuId()
        bucket._id = new ObjectId(bucket.uuid)
        const result = await this.collection.insertOne(bucket,{writeConcern: {w: 1, j: true}})
        if (result.insertedId == bucket._id && result.acknowledged) {
            return true
        }
        else return false        
    }

    async updateOne(bucket:BucketDataObject){
        bucket._id = new ObjectId(bucket.uuid)
        const result = await this.collection.replaceOne(
            {uuid: bucket.uuid }, 
            bucket,
            {upsert: false,writeConcern: {w: 1, j: true}}
        )
        if (result.acknowledged && result.matchedCount == 1) {
            return true
        }
        else return false          
    }

    async deleteByUuId(bucketUuId:string){
        const result = await this.collection.deleteOne({ uuid: bucketUuId },{writeConcern: {w: 1, j: true}})
        if (result.deletedCount == 1 && result.acknowledged) {
            return true
        }
        else return false             
    }

    async getByUuId(uuid:string) : Promise<BucketDataObject> {

        const cursor = this.collection.find({uuid : uuid});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as BucketDataObject);
            return document
        }

        return new BucketDataObject()
    }

    async getAll() : Promise<BucketDataObject[]> {
        const cursor = this.collection.find({});
        return (await cursor.toArray() as BucketDataObject[])
    }
    
    async fieldValueExists(processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {
        let filter:any = {}
        filter[fieldName] = String(fieldValue)
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