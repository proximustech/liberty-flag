import { MongoService } from "./MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { FlagDataObject } from "../dataObjects/FlagDataObject";

export class FlagService {
    
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

    getNew(){
        let flag = new FlagDataObject()
        flag.uuid = this.mongoService.createMongoUuId()
        flag._id = new ObjectId(flag.uuid)

        return flag
    }

    async create(flag:FlagDataObject){
        flag.uuid = this.mongoService.createMongoUuId()
        flag._id = new ObjectId(flag.uuid)        
        const result = await this.collection.insertOne(flag)
    }

    async updateOne(flag:FlagDataObject){
        flag._id = new ObjectId(flag.uuid)
        const result = await this.collection.replaceOne(
            {uuid: flag.uuid }, 
            flag,
            {upsert: false}
        )        
    }

    async deleteByUuId(flagUuId:string){
        const result = await this.collection.deleteOne({ uuid: flagUuId })
    }

    async getByUuId(uuid:string) : Promise<FlagDataObject> {

        const cursor = this.collection.find({uuid : uuid});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as FlagDataObject);
            return document
        }

        return new FlagDataObject()
    }

    async getAllByBucketUuid(bucketUuId:string) : Promise<FlagDataObject[]> {
        //await this.processTest()
        const cursor = this.collection.find({bucket_uuid: bucketUuId});
        return (await cursor.toArray() as FlagDataObject[])
    }
    

    private async processTest(){
        /**
         * Some process
         */

        let flagFirst = this.getNew()
        flagFirst.name = "First Name"
        flagFirst.bucket_uuid = "ABCDEFG"
        await this.create(flagFirst)

        let flag = await this.getByUuId(flagFirst.uuid)

        flag.name = "Other Name";
        await this.updateOne(flag)

        await this.deleteByUuId(flag.uuid)

    }

}