import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";

export const EngineStringDataObjectValidator:any = {

    validateSchema : {
        value : {
            regexp:"^.+$",
            message:"",
            required:true,
            requiredMessage : "The value is required."
        },       

    },

    validateFunction : DataObjectValidateFunction
}