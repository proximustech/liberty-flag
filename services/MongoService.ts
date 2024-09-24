import {v4 as uuidv4} from 'uuid';
import { env } from 'node:process';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { Uuid } from "../../../services/utilities";

export class MongoService {

    private client:MongoClient

    constructor(){
        // @ts-ignore
        this.client = new MongoClient(env.LIBERTY_FLAG_PLUGIN_MONGO_URI, {
            //serverApi: {
            //    version: ServerApiVersion.v1,
            //    strict: true,
            //    deprecationErrors: true,
            //}
        });        
    }

    getMongoClient(){
        return this.client
    }

    createMongoUuId(){
        //TODO: Remove this method
        return Uuid.createMongoUuId()
    }

}