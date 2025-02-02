import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";

export const EngineBooleanDataObjectValidator:any = {

    validateSchema : {
        status : {
            regexp:"^true|false$",
            message:"Status must be true or false",
            required:true,
            requiredMessage : "The status is required."
        },       

    },

    validateFunction : DataObjectValidateFunction
}