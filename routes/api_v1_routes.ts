import Router from "koa-router"
import { Context } from "koa";
import { FlagService } from "../services/FlagService";
import { FlagDataObject } from "../dataObjects/FlagDataObject";
import { env } from 'node:process';
import { ExceptionNotAuthorized } from "../../../types/exception_custom_errors";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let apiPrefix = "/api/v1"
    let apiSecurityPrefix="liberty_flag" //Must be the same value of the Liberty Flag prefix in the _liberty_flag_routes.ts file.

    router.post(apiPrefix+'/flags-config',koaBody(), async (ctx:Context) => {

        console.log("API Requested.")
        let userPermissions:any = [['','liberty_flag.flag','read']]
        const flagService = new FlagService(apiSecurityPrefix,userPermissions)

        try {
            let contextKey = ctx.request.body["context-key"] || ""
            let accessToken = ctx.request.body["access-token"] || ""
            if (accessToken === env.LIBERTY_FLAG_ACCESS_TOKEN) {
                if (contextKey !== "") {
    
        
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
    
                    flagService.dispose()
                    
                } else {
                    console.log('API - get_context_flags_data - No valid Context Key: "'+ contextKey + '"' )
                    ctx.status=400
                    ctx.body = {
                        status: 'error',
                        message: 'No valid Context Key'
                    }
                    
                }            
            }
            else {
                console.log('API - get_context_flags_data - Invalid Access Token: "'+ accessToken + '"' )
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    message: 'Invalid Access Token'
                }            
            }            
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user traying to READ on " + prefix +'.flag')
                
            }

            else {
                console.error(error)

            }               
        }

    })

    return router
}