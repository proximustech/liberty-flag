import { validateFunction } from "../../../values/dataObjectValidateFunction";

export class BucketDataObject {
    _id:any = ""
    uuid:string = ""
    name:string = ""
    subBuckets:Array<BucketDataObject> = []
}

export const BucketDataObjectValidator:any = {

    validateData : {
        name : {
            regexp:".{5,30}",
            message:"Name must be in the range of 5 and 30 characters."
        },
    },

    validateFunction : validateFunction
}