import { BucketDataObject} from "../dataObjects/BucketDataObject";

export class BucketServiceCrudMiddleware {

    beforeCreate(bucket:BucketDataObject):BucketDataObject{
        return bucket
    }
    beforeUpdate(bucket:BucketDataObject):BucketDataObject{
        return bucket
    }
    beforeDelete(bucketUuId:string){
        return bucketUuId
    }        
}