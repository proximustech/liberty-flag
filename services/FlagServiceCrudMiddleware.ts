import { FlagDataObject} from "../dataObjects/FlagDataObject";

export class FlagServiceCrudMiddleware {

    beforeFormShow(flag:FlagDataObject):FlagDataObject{
        return flag
    }
    beforeCreate(flag:FlagDataObject):FlagDataObject{
        return flag
    }
    beforeUpdate(flag:FlagDataObject):FlagDataObject{
        return flag
    }
    beforeDelete(flagUuId:string){
        return flagUuId
    }        
}