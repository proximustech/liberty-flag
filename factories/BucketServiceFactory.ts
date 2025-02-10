import { BucketService } from "../services/BucketService";
import { BucketModel } from "../models/BucketModel";

export class BucketServiceFactory{

    public static create(prefix:string,userPermissions:any,bucketModel = new BucketModel()): BucketService{

        return new BucketService(
            bucketModel,
            prefix,
            userPermissions
        )

    }

}