import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class EngineBooleanDataObject {
    status:boolean
    constructor(status:boolean){
        this.status = status
    }
}

export const EngineBooleanDataObjectValidator:any = {

    validateSchema : {
        status : {
            regexp:"^true@false$",
            message:"Status must be true or false",
            required:true,
            requiredMessage : "The status is required."
        },       

    },

    validateFunction : DataObjectValidateFunction
}

export const EngineBooleanDataObjectSpecs:any = {

    metadata : {
        status : {
            label:"Status",
            validationRequired: EngineBooleanDataObjectValidator.validateSchema.status.required,
            validationRegexp: EngineBooleanDataObjectValidator.validateSchema.status.regexp,
            validationMessage: EngineBooleanDataObjectValidator.validateSchema.status.message,
            validationRequiredMessage: EngineBooleanDataObjectValidator.validateSchema.status.requiredMessage,
            inputType:"switch"
        },      

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}