import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class EngineParametersBooleanDataObject {
    status:boolean
    constructor(status:boolean){
        this.status = status
    }
}

export const EngineParametersBooleanDataObjectValidator:any = {

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

export const EngineParametersBooleanDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Tag Name",
            validationRequired: EngineParametersBooleanDataObjectValidator.validateSchema.name.required,
            validationRegexp: EngineParametersBooleanDataObjectValidator.validateSchema.name.regexp,
            validationMessage: EngineParametersBooleanDataObjectValidator.validateSchema.name.message,
            validationRequiredMessage: EngineParametersBooleanDataObjectValidator.validateSchema.name.requiredMessage,
            inputType:"switch"
        },      

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}