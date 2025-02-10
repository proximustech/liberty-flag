import { FlagService } from "../services/FlagService";
import { FlagModel } from "../models/FlagModel";

export class FlagServiceFactory{

    public static create(prefix:string,userPermissions:any,flagModel = new FlagModel()): FlagService{

        return new FlagService(
            flagModel,
            prefix,
            userPermissions
        )

    }

}