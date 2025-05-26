import { BucketDataObject} from "../dataObjects/BucketDataObject";

export class BucketServiceCrudMiddleware {

    beforeFormShow(bucket:BucketDataObject):BucketDataObject{
        return bucket
    }
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