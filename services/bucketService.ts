import { MongoService } from "../services/MongoService";
import { BucketDataObject } from "../dataObjects/bucketDataObject";

import { ObjectId,MongoClient } from 'mongodb';

export class BucketService {

    mongoClient:MongoClient
    mongoService:MongoService

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

        const db = this.mongoClient.db("lf_plugin");
        await db.collection('buckets').insertOne(bucket)

        return bucket
    }

    update(bucket:BucketDataObject){
        return bucket
    }

    delete(bucketUuid:string){

    }

    getByUuId(uuid:string){
        
    }

    async getAll(){
        let buckets:Array<BucketDataObject> = []

        let bucket = await this.create("LP")
        buckets.push(bucket)

        return buckets
    }

}