import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class BucketDataObject {
    _id:any = ""
    uuid:string = ""

    name:string = ""
    tags:Array<string> = []
    description:string = ""
    contexts:Array<BucketContextDataObject> = []
    subBuckets:Array<BucketDataObject> = []
}

export const BucketDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:"^.{5,30}$",
            message:"Bucket name must be in the range of 5 and 30 characters.",
            required:true,
            requiredMessage : "Bucket name is required."
        },
        description : {
            regexp:"^(.|\\n){30,200}$$",
            message:"Bucket description must be in the range of 30 and 200 characters.",
            required:false,
            requiredMessage : ""
        },

    },

    validateFunction : DataObjectValidateFunction
}

export const BucketDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Bucket Name",
            validationRequired: BucketDataObjectValidator.validateSchema.name.required,
            validationRegexp: BucketDataObjectValidator.validateSchema.name.regexp,
            validationMessage: BucketDataObjectValidator.validateSchema.name.message,
            validationRequiredMessage: BucketDataObjectValidator.validateSchema.name.requiredMessage,
            inputType:"text"
        },
        
        description : {
            label:"Bucket Description",
            validationRequired: BucketDataObjectValidator.validateSchema.description.required,
            validationRegexp: BucketDataObjectValidator.validateSchema.description.regexp,
            validationMessage: BucketDataObjectValidator.validateSchema.description.message,
            validationRequiredMessage: BucketDataObjectValidator.validateSchema.description.requiredMessage,
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
            regexp:"^.{1,20}$",
            message:"Context name must be in the range of 1 and 20 characters.",
            required:true,
            requiredMessage:"Context name is required.",
        },

    },

    validateFunction : DataObjectValidateFunction
}

export const BucketContextDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Context Name",
            validationRequired: BucketContextDataObjectValidator.validateSchema.name.required,
            validationRegexp: BucketContextDataObjectValidator.validateSchema.name.regexp,
            validationMessage: BucketContextDataObjectValidator.validateSchema.name.message,
            validationRequiredMessage: BucketContextDataObjectValidator.validateSchema.name.requiredMessage,
            inputType:"text"
        },

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}