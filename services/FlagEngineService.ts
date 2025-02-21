import { FlagContextDataObject } from "../dataObjects/FlagDataObject";

export class FlagEngineService  {
    
    static getValueFromContext(context:FlagContextDataObject){

        if (context.engine==="string") {
            return context.engine_parameters.string.value
        }
        else if (context.engine==="boolean") {
            return context.engine_parameters.boolean.status
        }
        
    }

}