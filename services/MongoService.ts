import { IDisposable } from "../../../interfaces/disposable_interface";

import { MongoClient, ServerApiVersion } from 'mongodb';
import { Config } from "../values/config";

export class MongoService implements IDisposable {

    private client:MongoClient

    constructor(){
        // @ts-ignore
        this.client = new MongoClient(Config.LIBERTY_FLAG_PLUGIN_MONGO_URI, {
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