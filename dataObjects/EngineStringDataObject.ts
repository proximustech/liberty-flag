import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";

export const EngineStringDataObjectValidator:any = {

    validateSchema : {
        value : {
            regexp:"^.+$",
            message:"",
            required:true,
            requiredMessage : "The String Engine selected option is required."
        },       
        configuration : {
            regexp:"^.+$",
            message:"",
            required:true,
            requiredMessage : "The value configuration is required."
        },       

    },

    validateFunction : DataObjectValidateFunction,
    extraValidateFunction : (data:any) => {
        let result:any = {
            isValid :false,
            messages:[{
                field:"Engine string configuration",
                message:"The string selected value MUST be one of the options in configuration."
            }]
        }

        let stringOptions=data.configuration.split("|")
        for (let stringOptionsindex = 0; stringOptionsindex < stringOptions.length; stringOptionsindex++) {
            const stringOption = stringOptions[stringOptionsindex];
            if (stringOption===data.value) {
                result.isValid = true
                break
            }
        }
        return result
    }
}