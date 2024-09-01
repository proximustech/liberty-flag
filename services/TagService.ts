import { MongoService } from "./MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { TagDataObject } from "../dataObjects/TagDataObject";

export class TagService {
    
    private dataBaseName = "lf_plugin"
    private collectionName = "tags"
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
        let tag = new TagDataObject()
        tag.uuid = this.mongoService.createMongoUuId()
        tag._id = new ObjectId(tag.uuid)

        return tag
    }

    async create(tag:TagDataObject){
        const result = await this.collection.insertOne(tag)
    }

    async updateOne(tag:TagDataObject){
        const result = await this.collection.replaceOne(
            {uuid: tag.uuid }, 
            tag,
            {upsert: false}
        )        
    }

    async deleteByUuId(tagUuId:string){
        const result = await this.collection.deleteOne({ uuid: tagUuId })
    }

    async getByUuId(uuid:string) : Promise<TagDataObject> {

        const cursor = this.collection.find({uuid : uuid});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as TagDataObject);
            return document
        }

        return new TagDataObject()
    }

    async getAll() : Promise<TagDataObject[]> {
        //await this.processTest()
        const cursor = this.collection.find({});
        return (await cursor.toArray() as TagDataObject[])
    }
    

    private async processTest(){
        /**
         * Some process
         */

        let tagFirst = this.getNew()
        tagFirst.name = "First Name"

        await this.create(tagFirst)

        let tag = await this.getByUuId(tagFirst.uuid)

        tag.name = "Other Name";
        await this.updateOne(tag)

        await this.deleteByUuId(tag.uuid)

    }

}