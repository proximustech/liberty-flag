import { IDisposable } from "../../../interfaces/disposable_interface";

import { MongoService } from "../services/MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { TagDataObject } from "../dataObjects/TagDataObject";
import { Uuid } from "../../../services/utilities";

export class TagModel implements IDisposable {
    
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

    async create(tag:TagDataObject){
        tag.uuid = Uuid.createMongoUuId()
        tag._id = new ObjectId(tag.uuid)        
        const result = await this.collection.insertOne(tag,{writeConcern: {w: 1, j: true}})
        if (result.insertedId == tag._id && result.acknowledged) {
            return true
        }
        else return false           
    }

    async updateOne(tag:TagDataObject){
        tag._id = new ObjectId(tag.uuid)
        const result = await this.collection.replaceOne(
            {uuid: tag.uuid }, 
            tag,
            {upsert: false,writeConcern: {w: 1, j: true}}
        ) 
        if (result.acknowledged && result.matchedCount == 1) {
            return true
        }
        else return false                  
    }

    async deleteByUuId(tagUuId:string){
        const result = await this.collection.deleteOne({ uuid: tagUuId },{writeConcern: {w: 1, j: true}})
        if (result.deletedCount == 1 && result.acknowledged) {
            return true
        }
        else return false           
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

    dispose(){
        this.mongoService.dispose()
    }  

}