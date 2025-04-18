import { IDisposable } from "../../../interfaces/disposable_interface";

import { MongoService } from "../services/MongoService";
import { ObjectId,MongoClient,Db,Collection } from 'mongodb';
import { FlagDataObject } from "../dataObjects/FlagDataObject";
import { Uuid } from "../../../services/utilities";
import { ExceptionRecordAlreadyExists} from "../../../types/exceptions";

export class FlagModel implements IDisposable {
    
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

    async create(flag:FlagDataObject){
        flag.uuid = Uuid.createMongoUuId()
        flag._id = new ObjectId(flag.uuid)        
        const result = await this.collection.insertOne(flag,{writeConcern: {w: 1, j: true}}).catch((error) => {
            if (error.code === 11000) {
                throw new ExceptionRecordAlreadyExists("Name already exists")
            } else {
              console.log(error);
              throw new Error("DB Unexpected Error");
            }
        });
        if (result.insertedId == flag._id && result.acknowledged) {
            return flag.uuid
        }
        else return "false"
        
    }

    async updateOne(flag:FlagDataObject){
        flag._id = new ObjectId(flag.uuid)
        const result = await this.collection.replaceOne(
            {uuid: String(flag.uuid) }, 
            flag,
            {upsert: false,writeConcern: {w: 1, j: true}}
        ).catch((error) => {
            if (error.code === 11000) {
                throw new ExceptionRecordAlreadyExists("Name already exists")
            } else {
              console.log(error);
              throw new Error("DB Unexpected Error");
            }
        });

        if (result.acknowledged && result.matchedCount == 1 ) {
            return true
        }
        else return false     
    }

    async deleteByUuId(flagUuId:string){
        const result = await this.collection.deleteOne({ uuid: String(flagUuId) },{writeConcern: {w: 1, j: true}})
        if (result.deletedCount == 1 && result.acknowledged) {
            return true
        }
        else return false
    }
    async deleteByBucketUuId(bucketUuId:string){
        const result = await this.collection.deleteMany({ bucket_uuid: String(bucketUuId) },{writeConcern: {w: 1, j: true}})
        if (result.acknowledged) {
            return true
        }
        else return false
    }
    async deleteFromTags(tagUuId:string){

        //@ts-ignore
        const result = await this.collection.updateMany({tags:tagUuId},{$pull:{tags:tagUuId}},{writeConcern: {w: 1, j: true}})

        if (result.acknowledged) {
            return true
        }
        else return false
    }
    async deleteFromContexts(contextUuId:string){

        //@ts-ignore
        const result = await this.collection.updateMany({"contexts.bucket_context_uuid":contextUuId},{$pull:{contexts:{bucket_context_uuid:contextUuId}}},{writeConcern: {w: 1, j: true}})

        if (result.acknowledged) {
            return true
        }
        else return false
    }

    async getByNameAndBucketUuid(name:string,bucketUuid:string) : Promise<FlagDataObject> {

        const cursor = this.collection.find({name : String(name),bucket_uuid:String(bucketUuid)});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as FlagDataObject);
            return document
        }

        return new FlagDataObject()
    }

    async getByNameAndContextKey(name:string,contextKey:string) : Promise<FlagDataObject> {

        const cursor = this.collection.find({name : String(name),"contexts.bucket_context_uuid":String(contextKey)});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as FlagDataObject);
            return document
        }

        return new FlagDataObject()
    }

    async getByUuId(uuid:string) : Promise<FlagDataObject> {

        const cursor = this.collection.find({uuid : String(uuid)});

        while (await cursor.hasNext()) {
            let document = (await cursor.next() as FlagDataObject);
            return document
        }

        return new FlagDataObject()
    }

    async getAll(filter:any={},limit=0,skip=0) : Promise<FlagDataObject[]> {
        for (const [key, value] of Object.entries(filter)) {
            if (key != "bucket_uuid") {
                filter[key]=new RegExp(`.*${value}.*`)
                
            }
        } 

        let limitStage = [{
            $limit : limit
        }]
        let skipStage = [{
            $skip : skip
        }]        

        let pipeline = [
            { 
                $match: filter
            },
            { 
                $sort: { name : 1 }
            }
        ] 

        if (skip > 0) {
            //@ts-ignore
            pipeline = pipeline.concat(skipStage)
        }        
        if (limit > 0) {
            //@ts-ignore
            pipeline = pipeline.concat(limitStage)
        }             

        const cursor = this.collection.aggregate(pipeline);
        return (await cursor.toArray() as FlagDataObject[])
    }

    async getCount(filter:any={}) : Promise<number> {
        let localFilter = structuredClone(filter)

        for (const [key, value] of Object.entries(localFilter)) {
            if (key != "bucket_uuid") {
                localFilter[key]=new RegExp(`.*${value}.*`)
                
            }
        }         
        return await this.collection.countDocuments(localFilter);
    }      

    async getAllByBucketUuid(bucketUuId:string) : Promise<FlagDataObject[]> {
        const cursor = this.collection.find({bucket_uuid: String(bucketUuId)});
        return (await cursor.toArray() as FlagDataObject[])
    }

    async getAllByContextUuid(contextUuId:string) : Promise<FlagDataObject[]> {
        const cursor = this.collection.find({"contexts.bucket_context_uuid": String(contextUuId)});
        return (await cursor.toArray() as FlagDataObject[])
    }        

    async fieldValueExists(processedDocumentBucketUuid:string,processedDocumentUuid:string,fieldName:string,fieldValue:any) : Promise<Boolean> {
        let filter:any = {}
        filter[fieldName] = String(fieldValue)
        filter["bucket_uuid"] = processedDocumentBucketUuid
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