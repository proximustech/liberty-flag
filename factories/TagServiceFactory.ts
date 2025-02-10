import { TagService } from "../services/TagService";
import { TagModel } from "../models/TagModel";

export class TagServiceFactory{

    public static create(prefix:string,userPermissions:any,tagModel = new TagModel()): TagService{

        return new TagService(
            tagModel,
            prefix,
            userPermissions
        )

    }

}