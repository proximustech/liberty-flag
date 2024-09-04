import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class BucketDataObject {
    _id:any = ""
    uuid:string = ""
    name:string = ""
    subBuckets:Array<BucketDataObject> = []
}

export const BucketDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:".{5,30}",
            message:"Name must be in the range of 5 and 30 characters."
        },
    },

    validateFunction : DataObjectValidateFunction
}

export const BucketDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Name",
            regexp: BucketDataObjectValidator.validateSchema.name.regexp,
            inputType:"text"
        },
    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}