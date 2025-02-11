import { BucketService } from "../services/BucketService";
import { BucketModel } from "../models/BucketModel";
import { FlagServiceFactory } from "../factories/FlagServiceFactory";
import { FlagService } from "../services/FlagService";

export class BucketServiceFactory{

    public static create(

        prefix:string,
        userPermissions:any,
        bucketModel = new BucketModel(),
        flagService:FlagService = FlagServiceFactory.create(prefix,userPermissions)
        
        ): BucketService{


        return new BucketService(
            bucketModel,
            flagService,
            prefix,
            userPermissions
        )

    }

}