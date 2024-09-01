import {v4 as uuidv4} from 'uuid';
import { env } from 'node:process';
import { MongoClient, ServerApiVersion } from 'mongodb';

export class MongoService {

    private client:MongoClient

    constructor(){
        // @ts-ignore
        this.client = new MongoClient(env.LIBERTY_FLAG_PLUGIN_MONGO_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });        
    }

    getMongoClient(){
        return this.client
    }

    createMongoUuId(){
        return uuidv4().split("-").join("").substring(0,24)
    }

}