import { BucketDataObject } from "../dataObjects/bucketDataObject";
import {v4 as uuidv4} from 'uuid';
import { env } from 'node:process';
import { MongoClient, ServerApiVersion,ObjectId } from 'mongodb';

export class BucketService {

    client:MongoClient

    constructor(){
        // @ts-ignore
        this.client = new MongoClient(env.MONGO_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });        
    }

    async create(name:string){
        let bucket = new BucketDataObject()
        bucket.name = name
        bucket.uuid = uuidv4().split("-").join("").substring(0,24)
        bucket._id = new ObjectId(bucket.uuid)
        bucket.subBuckets = []

        const db = this.client.db("lf_plugin");
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

    close(){
        this.client.close()
    }
}