import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";

export class EngineBooleanConditionedDataObject {
    conditions:Array<EngineBooleanConditionedConditionDataObject> = []
}

export class EngineBooleanConditionedConditionDataObject {
    first_parameter:string =""
    second_parameter:string =""
    operator_parameter:string =""
}

export const EngineBooleanConditionedConditionDataObjectValidator:any = {

    validateSchema : {
        first_parameter : {
            regexp:"^.+$",
            message:"",
            required:true,
            requiredMessage : "Boolean condition (True IF ALL): Key is required."
        },       
        second_parameter : {
            regexp:"^.*$",
            message:"",
            required:false,
            requiredMessage : ""
        },
        operator_parameter : {
            regexp:"^(equal|different|less_than|greater_than)$",
            message:"The operator_parameter MUST be one of: equal,different,less_than,greater_than",
            required:true,
            requiredMessage : "Boolean condition (True IF ALL): Operator is required."
        },         

    },

    validateFunction : DataObjectValidateFunction
}