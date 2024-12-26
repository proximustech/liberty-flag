import { MongoService } from "./MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { BucketDataObject } from "../dataObjects/BucketDataObject";
import { Uuid } from "../../../services/utilities";

export class BucketService {
    
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
        const result = await this.collection.insertOne(bucket)
    }

    async updateOne(bucket:BucketDataObject){
        bucket._id = new ObjectId(bucket.uuid)
        const result = await this.collection.replaceOne(
            {uuid: bucket.uuid }, 
            bucket,
            {upsert: false}
        )
    }

    async deleteByUuId(bucketUuId:string){
        const result = await this.collection.deleteOne({ uuid: bucketUuId })
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
        //await this.processTest()
        const cursor = this.collection.find({});
        return (await cursor.toArray() as BucketDataObject[])
    }
    
    async fieldValueExists(processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {
        let filter:any = {}
        filter[fieldName] = fieldValue
        const cursor = this.collection.find(filter);
        while (await cursor.hasNext()) {
            let document:any = await cursor.next();
            if (document.uuid !== processedDocumentUuid) {
                return true
            }
        }
        return false
    } 

}