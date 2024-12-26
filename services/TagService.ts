import { MongoService } from "./MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { TagDataObject } from "../dataObjects/TagDataObject";
import { Uuid } from "../../../services/utilities";

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

    async create(tag:TagDataObject){
        tag.uuid = Uuid.createMongoUuId()
        tag._id = new ObjectId(tag.uuid)        
        const result = await this.collection.insertOne(tag)
    }

    async updateOne(tag:TagDataObject){
        tag._id = new ObjectId(tag.uuid)
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
    
    getUuidMapFromList(list:TagDataObject[]) : Map<string, string> {
        //let result:any = {}
        const result = new Map<string, string>();
        list.forEach(tag => {
            //result[tag.name]=tag.uuid
            result.set(tag.uuid,tag.name)
        });

        return result
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