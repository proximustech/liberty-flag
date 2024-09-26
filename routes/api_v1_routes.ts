import Router from "koa-router"
import { Context } from "koa";
import { FlagService } from "../services/FlagService";
import { BucketService } from "../services/BucketService";
import { FlagDataObject,FlagDataObjectValidator,FlagDataObjectSpecs, FlagContextDataObject } from "../dataObjects/FlagDataObject";
//import { EngineBooleanDataObject,EngineBooleanDataObjectSpecs,EngineBooleanDataObjectValidator } from "../dataObjects/EngineBooleanDataObject";
//import { EngineBooleanConditionedDataObject,EngineBooleanConditionedConditionDataObject,EngineBooleanConditionedConditionDataObjectValidator } from "../dataObjects/EngineBooleanConditionedDataObject";

import koaBody from 'koa-body';

module.exports = function(router:Router,viewVars:any,prefix:string){

    let apiPrefix = "/api/v1"

    router.post(apiPrefix+'/get_context_flags_data',koaBody(), async (ctx:Context) => {

        console.log("API Requested.")

        let contextKey = ctx.request.body["context-key"] || ""

        if (contextKey !== "") {

            const flagService = new FlagService()

            let responseFlags:any = []
            let flags:Array<FlagDataObject> = await flagService.getAllByContextUuid(contextKey)
    
            flags.forEach(flag => {
    
                flag.contexts.forEach(context => {
                    if(context.bucket_context_uuid === contextKey ){
                        responseFlags.push({
                            name:flag.name,
                            configuration:{
                                engine:context.engine,
                                parameters:context.engine_parameters[context.engine]
                            }
                        })
                        /*
                        responseFlags.push({
                            name:flag.name,
                            value:context.engine_parameters.boolean.status
                        })
                        */
                        
                    }
                    
                });
    
            });

            if (flags.length == 0) {
                console.log('API - get_context_flags_data - No flags for Context Key: "'+ contextKey + '"' )
            }

            ctx.body = {
                status: 'success',
                flags: responseFlags
            }
            
        } else {
            console.log('API - get_context_flags_data - No valid Context Key: "'+ contextKey + '"' )
            ctx.status=400
            ctx.body = {
                status: 'error',
                message: 'No valid Context Key'
            }
            
        }

    })

    return router
}