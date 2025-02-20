import { TagService } from "../services/TagService";
import { TagModel } from "../models/TagModel";
import { FlagServiceFactory } from "../factories/FlagServiceFactory";
import { FlagService } from "../services/FlagService";
import { BucketServiceFactory } from "../factories/BucketServiceFactory";
import { BucketService } from "../services/BucketService";

export class TagServiceFactory{

    public static create(
        prefix:string,
        userPermissions:any,
        tagModel = new TagModel(),
        flagService:FlagService = FlagServiceFactory.create(prefix,userPermissions),
        bucketService:BucketService = BucketServiceFactory.create(prefix,userPermissions)
        
        ): TagService{

        return new TagService(
            tagModel,
            flagService,
            bucketService,
            prefix,
            userPermissions
        )

    }

}