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

    validateFunction : DataObjectValidateFunction
}