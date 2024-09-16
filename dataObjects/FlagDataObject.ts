import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class FlagDataObject {
    _id:any = ""
    bucket_uuid:string = ""
    uuid:string = ""
    
    name:string = ""
    description:string = ""

    contexts:Array<FlagContextDataObject> = []

}

export const FlagDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:"^.{5,30}$",
            message:"Flag name must be in the range of 5 and 30 characters.",
            required:true,
            requiredMessage : "Flag name is required."
        },
        description : {
            regexp:"^(.|\\n){30,200}$$",
            message:"Flag description must be in the range of 30 and 200 characters.",
            required:false,
            requiredMessage : ""
        },        

    },

    validateFunction : DataObjectValidateFunction
}

export const FlagDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Flag Name",
            validationRequired: FlagDataObjectValidator.validateSchema.name.required,
            validationRegexp: FlagDataObjectValidator.validateSchema.name.regexp,
            validationMessage: FlagDataObjectValidator.validateSchema.name.message,
            validationRequiredMessage: FlagDataObjectValidator.validateSchema.name.requiredMessage,
            inputType:"text"
        },
        description : {
            label:"Flag Description",
            validationRequired: FlagDataObjectValidator.validateSchema.description.required,
            validationRegexp: FlagDataObjectValidator.validateSchema.description.regexp,
            validationMessage: FlagDataObjectValidator.validateSchema.description.message,
            validationRequiredMessage: FlagDataObjectValidator.validateSchema.description.requiredMessage,
            inputType:"text_area"
        },        

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}

export class FlagContextDataObject {

    bucket_context_uuid:string = ""
    //Name of the engine that will be asossiated with the Engine Paramenters object in backend and with the Engine Function in client
    engine:string =""
    //Each key is the engine name, and the value is an object with the parameters
    engine_parameters:any = {}

}