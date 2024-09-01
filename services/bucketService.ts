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

    async createByName(name:string){
        let bucket = new BucketDataObject()
        bucket.name = name
        bucket.uuid = this.mongoService.createMongoUuId()
        bucket._id = new ObjectId(bucket.uuid)
        bucket.subBuckets = []

        const db = this.mongoClient.db(this.dataBase);
        const result = await db.collection(this.collection).insertOne(bucket)

        return bucket
    }

    async updateOne(bucket:BucketDataObject){
        const db = this.mongoClient.db(this.dataBase)
        const result = await db.collection(this.collection).replaceOne({
          uuid: bucket.uuid }, bucket,
          {upsert: false}
        )        

    }

    async deleteByUuId(bucketuuId:string){
        const db = this.mongoClient.db(this.dataBase)
        const result = await db.collection(this.collection).deleteOne({ uuid: bucketuuId })
    }

    async getByUuId(uuid:string) : Promise<BucketDataObject> {

        const db = this.mongoClient.db(this.dataBase)
        const cursor = await db.collection(this.collection).find({uuid : uuid});

        while (await cursor.hasNext()) {
            // @ts-ignore
            let document:BucketDataObject = await cursor.next();
            return document
        }

        return new BucketDataObject()

    }

    
    async getAll() : Promise<BucketDataObject[]> {

        await this.processTest()

        let list: BucketDataObject[] = [];
        const db = this.mongoClient.db(this.dataBase)
        const cursor = db.collection(this.collection).find({});
    
        while (await cursor.hasNext()) {
            let document = (await cursor.next() as BucketDataObject) ;
            list.push(document);
        }

        return list
    }
    

    private async processTest(){
        /**
         * Some process
         */

        let bucketFirst = await this.createByName("First Name")

        let bucket = await this.getByUuId(bucketFirst.uuid)

        bucket.name = "Second Name";
        await this.updateOne(bucket)

        this.deleteByUuId(bucket.uuid)

    }

}