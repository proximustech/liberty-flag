import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class BucketDataObject {
    _id:any = ""
    uuid:string = ""

    name:string = ""
    description:string = ""
    contexts:Array<ContextDataObject> = []
    subBuckets:Array<BucketDataObject> = []
}

export class ContextDataObject {
    name:string = ""
}

export const BucketDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:"^.{5,30}$",
            message:"Name must be in the range of 5 and 30 characters."
        },
        description : {
            regexp:"^.{10,30}$",
            message:"Name must be in the range of 10 and 30 characters."
        },

    },

    validateFunction : DataObjectValidateFunction
}

export const BucketDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Bucket Name",
            validationRegexp: BucketDataObjectValidator.validateSchema.name.regexp,
            validationMessage: BucketDataObjectValidator.validateSchema.name.message,
            inputType:"text"
        },
        /*
        description : {
            label:"Bucket Description",
            validationRegexp: BucketDataObjectValidator.validateSchema.description.regexp,
            validationMessage: BucketDataObjectValidator.validateSchema.description.message,
            inputType:"text_area"
        },
        */

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}