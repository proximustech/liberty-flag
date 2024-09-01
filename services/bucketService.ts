import { MongoService } from "./MongoService";
import { ObjectId,MongoClient } from 'mongodb';
import { BucketDataObject } from "../dataObjects/bucketDataObject";

export class BucketService {

    private mongoClient:MongoClient
    private mongoService:MongoService
    private dataBase = "lf_plugin"
    private collection = "buckets"

    constructor(){
        this.mongoService = new MongoService()
        this.mongoClient = this.mongoService.getMongoClient()
    }

    async create(name:string){
        let bucket = new BucketDataObject()
        bucket.name = name
        bucket.uuid = this.mongoService.createMongoUuId()
        bucket._id = new ObjectId(bucket.uuid)
        bucket.subBuckets = []

        const db = this.mongoClient.db(this.dataBase);
        const result = await db.collection(this.collection).insertOne(bucket)

        return bucket
    }

    async update(bucket:BucketDataObject){

        const db = this.mongoClient.db(this.dataBase)
        const buckets = db.collection(this.collection);
        const result = await buckets.replaceOne({
          uuid: bucket.uuid }, bucket,
          {upsert: false}
        )        

    }

    delete(bucketUuid:string){

    }

    getByUuId(uuid:string){
        
    }

    async getAll(){
        let buckets:Array<BucketDataObject> = []

        let bucket = await this.create("First Name")
        buckets.push(bucket)
        
        bucket.name = "Second Name";
        await this.update(bucket)
        buckets.push(bucket)
        
        return buckets
    }

}