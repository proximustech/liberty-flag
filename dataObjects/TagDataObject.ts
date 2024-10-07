import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class TagDataObject {
    _id:any = ""
    uuid:string = ""
    name:string = ""
    description:string = ""
}

export const TagDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:"^.{5,30}$",
            message:"Tag name must be in the range of 5 and 30 characters.",
            required:true,
            requiredMessage : "Tag name is required."
        },
        description : {
            regexp:"^(.|\\n){30,200}$",
            message:"Tag description must be in the range of 30 and 200 characters.",
            required:false,
            requiredMessage : ""
        },        

    },

    validateFunction : DataObjectValidateFunction
}

export const TagDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Tag Name",
            validationRequired: TagDataObjectValidator.validateSchema.name.required,
            validationRegexp: TagDataObjectValidator.validateSchema.name.regexp,
            validationMessage: TagDataObjectValidator.validateSchema.name.message,
            validationRequiredMessage: TagDataObjectValidator.validateSchema.name.requiredMessage,
            inputType:"text"
        },
        description : {
            label:"Tag Description",
            validationRequired: TagDataObjectValidator.validateSchema.description.required,
            validationRegexp: TagDataObjectValidator.validateSchema.description.regexp,
            validationMessage: TagDataObjectValidator.validateSchema.description.message,
            validationRequiredMessage: TagDataObjectValidator.validateSchema.description.requiredMessage,
            inputType:"text_area"
        },        

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}