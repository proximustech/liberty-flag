import { IDisposable } from "../../../interfaces/disposable_interface";

import { env } from 'node:process';
import { MongoClient, ServerApiVersion } from 'mongodb';

export class MongoService implements IDisposable {

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

    dispose(){
        this.client.close()
    }   
    
}