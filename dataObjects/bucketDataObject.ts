import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class BucketDataObject {
    _id:any = ""
    uuid:string = ""

    name:string = ""
    description:string = ""
    contexts:Array<BucketContextDataObject> = []
    subBuckets:Array<BucketDataObject> = []
}

export const BucketDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:"^.{5,30}$",
            message:"Name must be in the range of 5 and 30 characters."
        },
        description : {
            regexp:"^(.|\\n){30,200}$$",
            message:"Description must be in the range of 30 and 200 characters."
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
        
        description : {
            label:"Bucket Description",
            validationRegexp: BucketDataObjectValidator.validateSchema.description.regexp,
            validationMessage: BucketDataObjectValidator.validateSchema.description.message,
            inputType:"text_area"
        },

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}

export class BucketContextDataObject {
    name:string = ""
    uuid:string = ""
}

export const BucketContextDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:"^.{1,10}$",
            message:"Name must be in the range of 1 and 10 characters."
        },

    },

    validateFunction : DataObjectValidateFunction
}

export const BucketContextDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Context Name",
            validationRegexp: BucketContextDataObjectValidator.validateSchema.name.regexp,
            validationMessage: BucketContextDataObjectValidator.validateSchema.name.message,
            inputType:"text"
        },

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}