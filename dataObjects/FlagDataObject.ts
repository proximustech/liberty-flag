import { DataObjectValidateFunction } from "../../../services/dataObjectValidateService";
import { HtmlDataObjectFieldRender,HtmlDataObjectRender } from "../../../services/dataObjectHtmlGenerator";
import { IllegalCharacters as IllegalCharactersRegexp, IllegalCharactersValidationMessage } from "../../../values/regular_expressions";
import { EngineBooleanConditionedConditionDataObjectValidator } from "./EngineBooleanConditionedDataObject";
import { EngineStringDataObjectValidator } from "./EngineStringDataObject";
import { EngineBooleanDataObjectValidator } from "./EngineBooleanDataObject";
import { EngineNumericDataObjectValidator } from "./EngineNumericDataObject";

export class FlagDataObject {
    _id:any = ""
    bucket_uuid:string = ""
    uuid:string = ""
    
    name:string = ""
    tags:Array<string> = []
    description:string = ""
    temp_data={}

    contexts:Array<FlagContextDataObject> = []

}

export const FlagDataObjectValidator:any = {

    validateSchema : {
        name : {
            regexp:String.raw`^\S{5,30}$`,
            message:"Flag name must be in the range of 5 and 30 characters without spaces.",
            required:true,
            requiredMessage : "Flag name is required."
        },
        description : {
            regexp:"^(.|\\n){30,200}$",
            message:"Flag description must be in the range of 30 and 200 characters.",
            required:false,
            requiredMessage : ""
        },
        uuid : {
            regexp:String.raw`(^\S{24}$)|(^$)`,
            message:"uuid format is invalid.",
            required:false,
            requiredMessage : ""
        },                  
        bucket_uuid : {
            regexp:String.raw`(^\S{24}$)|(^$)`,
            message:"bucket uuid format is invalid.",
            required:true,
            requiredMessage : "Bucket uuid is required."
        },                  

    },

    validateFunction : DataObjectValidateFunction,
    extraValidateFunction : (data:any,extraData:any={oldData:false}) => {

        let oldData:any=extraData.oldData

        let result:any = {
            isValid :true,
            messages:[]
        } 

        //This code executes well in the backend but not in the browser. Leaving this validation section to the backend
        try {
            for (let flagContextIndex = 0; flagContextIndex < data.contexts.length; flagContextIndex++) {
                const flagContext = data.contexts[flagContextIndex];

                let flagContextValidationResult = FlagContextDataObjectValidator.validateFunction(flagContext,FlagContextDataObjectValidator.validateSchema)

                if (flagContextValidationResult.isValid) {
                    if (oldData !== false && oldData.contexts.length > flagContextIndex) {
                        if (data.contexts[flagContextIndex].engine==="string" || oldData.contexts[flagContextIndex].engine==="string") {
                            if (data.contexts[flagContextIndex].engine==="string" && oldData.contexts[flagContextIndex].engine==="string") {
                                //Allowed
                            }
                            else{
                                result.isValid=false
                                result.messages.push({
                                    field:"engine",
                                    message:"Can NOT change the type of engine between string and others."
                                })
                            }
    
                            
                        }
                        if (data.contexts[flagContextIndex].engine==="numeric" || oldData.contexts[flagContextIndex].engine==="numeric") {
                            if (data.contexts[flagContextIndex].engine==="numeric" && oldData.contexts[flagContextIndex].engine==="numeric") {
                                //Allowed
                            }
                            else{
                                result.isValid=false
                                result.messages.push({
                                    field:"engine",
                                    message:"Can NOT change the type of engine between numeric and others."
                                })
                            }
    
                            
                        }
                        
                    }
                }
                if (result.isValid && flagContextValidationResult.isValid) {
                    if ('boolean_conditioned_true' in flagContext.engine_parameters){
                        for (let conditionIndex = 0; conditionIndex < flagContext.engine_parameters.boolean_conditioned_true.conditions.length; conditionIndex++) {
                            const condition = flagContext.engine_parameters.boolean_conditioned_true.conditions[conditionIndex];
                            let engineBooleanConditionedConditionValidationResult = EngineBooleanConditionedConditionDataObjectValidator.validateFunction(condition,EngineBooleanConditionedConditionDataObjectValidator.validateSchema)
                            if (!engineBooleanConditionedConditionValidationResult.isValid) {
                                result.isValid = false
                                result.messages = result.messages.concat(engineBooleanConditionedConditionValidationResult.messages)
                                break
                            }
                            
                        }
                    }
                    if ('boolean_conditioned_false' in flagContext.engine_parameters){
                        for (let conditionIndex = 0; conditionIndex < flagContext.engine_parameters.boolean_conditioned_false.conditions.length; conditionIndex++) {
                            const condition = flagContext.engine_parameters.boolean_conditioned_false.conditions[conditionIndex];
                            let engineBooleanConditionedConditionValidationResult = EngineBooleanConditionedConditionDataObjectValidator.validateFunction(condition,EngineBooleanConditionedConditionDataObjectValidator.validateSchema)
                            if (!engineBooleanConditionedConditionValidationResult.isValid) {
                                result.isValid = false
                                result.messages = result.messages.concat(engineBooleanConditionedConditionValidationResult.messages)
                                break
                            }
                            
                        } 
                    }
                    if ('boolean_conditionedor_true' in flagContext.engine_parameters){
                        for (let conditionIndex = 0; conditionIndex < flagContext.engine_parameters.boolean_conditionedor_true.conditions.length; conditionIndex++) {
                            const condition = flagContext.engine_parameters.boolean_conditionedor_true.conditions[conditionIndex];
                            let engineBooleanConditionedConditionValidationResult = EngineBooleanConditionedConditionDataObjectValidator.validateFunction(condition,EngineBooleanConditionedConditionDataObjectValidator.validateSchema)
                            if (!engineBooleanConditionedConditionValidationResult.isValid) {
                                result.isValid = false
                                result.messages = result.messages.concat(engineBooleanConditionedConditionValidationResult.messages)
                                break
                            }
                            
                        }
                    }            
                    if ('boolean_conditionedor_false' in flagContext.engine_parameters){
                        for (let conditionIndex = 0; conditionIndex < flagContext.engine_parameters.boolean_conditionedor_false.conditions.length; conditionIndex++) {
                            const condition = flagContext.engine_parameters.boolean_conditionedor_false.conditions[conditionIndex];
                            let engineBooleanConditionedConditionValidationResult = EngineBooleanConditionedConditionDataObjectValidator.validateFunction(condition,EngineBooleanConditionedConditionDataObjectValidator.validateSchema)
                            if (!engineBooleanConditionedConditionValidationResult.isValid) {
                                result.isValid = false
                                result.messages = result.messages.concat(engineBooleanConditionedConditionValidationResult.messages)
                                break
                            }
                            
                        }
                    }            
                    if ('string' in flagContext.engine_parameters && flagContext.engine==="string"){

                        let engineStringValidationResult = EngineStringDataObjectValidator.validateFunction(flagContext.engine_parameters.string,EngineStringDataObjectValidator.validateSchema,EngineStringDataObjectValidator.extraValidateFunction)
                        if (!engineStringValidationResult.isValid) {
                            result.isValid = false
                            result.messages = result.messages.concat(engineStringValidationResult.messages)                   
                            break
                        }
                    }                     
                    if ('numeric' in flagContext.engine_parameters && flagContext.engine==="numeric"){

                        let engineNumericValidationResult = EngineNumericDataObjectValidator.validateFunction(flagContext.engine_parameters.numeric,EngineNumericDataObjectValidator.validateSchema,EngineNumericDataObjectValidator.extraValidateFunction)
                        if (!engineNumericValidationResult.isValid) {
                            result.isValid = false
                            result.messages = result.messages.concat(engineNumericValidationResult.messages)                   
                            break
                        }
                    }                     
                    if ('boolean' in flagContext.engine_parameters){

                        let engineBooleanValidationResult = EngineBooleanDataObjectValidator.validateFunction(flagContext.engine_parameters.boolean,EngineBooleanDataObjectValidator.validateSchema)
                        if (!engineBooleanValidationResult.isValid) {
                            result.isValid = false
                            result.messages = result.messages.concat(engineBooleanValidationResult.messages)                   
                            break
                        }
                    }                     
                } else {
                    result.isValid = false
                    result.messages = result.messages.concat(flagContextValidationResult.messages)
                    break                    
                }
                         
                
            }            
        } catch (error) {

            if (error instanceof TypeError) {
                result.isValid = false
                result.messages =[{
                    field:"Flag context",
                    message:"Java Script Error: "+ error.message
                }]  
            }
        
        }

        return result
    }
}

export const FlagDataObjectSpecs:any = {

    metadata : {
        name : {
            label:"Flag Name",
            validationRequired: FlagDataObjectValidator.validateSchema.name.required,
            validationRegexp: FlagDataObjectValidator.validateSchema.name.regexp,
            validationMessage: FlagDataObjectValidator.validateSchema.name.message,
            validationRequiredMessage: FlagDataObjectValidator.validateSchema.name.requiredMessage,
            inputType:"text"
        },
        description : {
            label:"Flag Description",
            validationRequired: FlagDataObjectValidator.validateSchema.description.required,
            validationRegexp: FlagDataObjectValidator.validateSchema.description.regexp,
            validationMessage: FlagDataObjectValidator.validateSchema.description.message,
            validationRequiredMessage: FlagDataObjectValidator.validateSchema.description.requiredMessage,
            inputType:"text_area"
        },        

    },
    htmlDataObjectRender:HtmlDataObjectRender,
    htmlDataObjectFieldRender:HtmlDataObjectFieldRender
}

export class FlagContextDataObject {

    bucket_context_uuid:string = ""
    //Name of the engine that will be asossiated with the Engine Paramenters object in backend and with the Engine Function in client
    engine:string =""
    //Each key is the engine name, and the value is an object with the parameters
    engine_parameters:any = {}

}

export const FlagContextDataObjectValidator:any = {

    validateSchema : {
        bucket_context_uuid : {
            regexp:String.raw`^\S{24}$`,
            message:"Bucket context format is invalid",
            required:true,
            requiredMessage : "bucket_context_uuid is required."
        },
        engine : {
            regexp:"^(numeric|string|boolean|boolean_conditioned_true|boolean_conditioned_false|boolean_conditionedor_true|boolean_conditionedor_false)$",
            message:"Invalid context engine",
            required:true,
            requiredMessage : "The context engine is required."
        },        

    },

    validateFunction : DataObjectValidateFunction
}