import { MongoService } from "./MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { BucketDataObject } from "../dataObjects/BucketDataObject";

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

    //TODO: Remove
    getNew(){
        let bucket = new BucketDataObject()
        bucket.uuid = this.mongoService.createMongoUuId()
        bucket._id = new ObjectId(bucket.uuid)
        bucket.subBuckets = []

        return bucket
    }

    async create(bucket:BucketDataObject){
        bucket.uuid = this.mongoService.createMongoUuId()
        bucket._id = new ObjectId(bucket.uuid)
        const result = await this.collection.insertOne(bucket)
    }

    async updateOne(bucket:BucketDataObject){
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
    

    private async processTest(){
        /**
         * Some process
         */

        let bucketFirst = this.getNew()
        bucketFirst.name = "First Name"
        await this.create(bucketFirst)

        let bucket = await this.getByUuId(bucketFirst.uuid)

        bucket.name = "Other Name";
        await this.updateOne(bucket)

        //await this.deleteByUuId(bucket.uuid)

    }

}