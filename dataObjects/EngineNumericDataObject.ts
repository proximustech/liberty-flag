import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";

export const EngineNumericDataObjectValidator:any = {

    validateSchema : {
        value : {
            regexp:String.raw`^\d+$`,
            message:"The numeric value MUST be a number",
            required:true,
            requiredMessage : "The numeric value is required."
        },             
        min_value : {
            regexp:String.raw`^\d+$`,
            message:"The MIN numeric value MUST be a number",
            required:true,
            requiredMessage : "The MIN numeric value is required."
        },             
        max_value : {
            regexp:String.raw`^\d+$`,
            message:"The MAX numeric value MUST be a number",
            required:true,
            requiredMessage : "The MAX numeric value is required."
        },             

    },

    validateFunction : DataObjectValidateFunction,
    extraValidateFunction : (data:any) => {
        let result:any = {
            isValid :false,
            messages:[{
                field:"Engine numeric configuration",
                message:"The numeric value MUST to be between the min and max value range."
            }]
        }

        if (parseInt(data.value) >= parseInt(data.min_value) && parseInt(data.value) <= parseInt(data.max_value) ) {
            result.isValid = true
        }

        return result
    }
}
