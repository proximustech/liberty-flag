import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";

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
            requiredMessage : "Boolean condition: Key is required."
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
    validateFunction : (data:any,validateSchema:any) => {
        let fieldRegexp = ""
        let fieldValue:any = ""
        let regexpValidator = undefined
        let result:any = {
            isValid :true,
            messages:[]
        }
    
        result.isValid = true

        let secondParameterMustBeNumeric = false
        for (const [fieldName, fieldValue] of Object.entries(data)) {
            if (fieldName === "operator_parameter") {
                if (fieldValue === "less_than" || fieldValue === "greater_than") {
                    secondParameterMustBeNumeric = true
                }
            }
        }


        for (const [fieldName, fieldSchema] of Object.entries(validateSchema)) {

            fieldRegexp = validateSchema[fieldName]["regexp"]
            fieldValue = data[fieldName].toString()
    
            if (fieldValue === "") {
                if (validateSchema[fieldName]["required"]) {
                    result.isValid=false
                    result.messages.push({
                        field:fieldName,
                        message:validateSchema[fieldName]["requiredMessage"]
                    })                
                } 
                
            } else {
                regexpValidator = new RegExp(fieldRegexp);
                if (!regexpValidator.test(fieldValue)) {
                    result.isValid=false
                    result.messages.push({
                        field:fieldName,
                        message:validateSchema[fieldName]["message"]
                    })
                }
                
                if ( fieldName==="second_parameter" && secondParameterMustBeNumeric) {
                    if (!(!isNaN(parseFloat(fieldValue)) && isFinite(fieldValue))) {
                        result.isValid=false
                        result.messages.push({
                            field:fieldName,
                            message: "Engine 'True IF ALL Conditions': Value MUST be numeric for the 'Less than' or 'Greater than' comparison operators."
                        })
                    }                    
                }
                
                
            }
    
        }
        return result
    }
}