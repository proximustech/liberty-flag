import { BucketDataObject } from "../dataObjects/bucketDataObject";
import {v4 as uuidv4} from 'uuid';

export class BucketService {

    create(name:string){
        let bucket = new BucketDataObject()
        bucket.name = name
        bucket.subBuckets = []
        bucket.uuid = uuidv4();
        return bucket
        
    }
    update(bucket:BucketDataObject){
        return bucket
    }
    delete(bucketUuid:string){

    }
    getByUuId(uuid:string){
        
    }
    getAll(){
        let buckets:Array<BucketDataObject> = []

        let bucket = this.create("LP")
        buckets.push(bucket)

        return buckets
    }
}