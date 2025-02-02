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

    router.post(apiPrefix+'/get-flags-config',koaBody(), async (ctx:Context) => {

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
        } finally{
            flagService.dispose()
        }

    })

    router.post(apiPrefix+'/set-flag-config',koaBody(), async (ctx:Context) => {

        let userPermissions:any = [['','liberty_flag.flag','read'],['','liberty_flag.flag','write']]
        const flagService = new FlagService(apiSecurityPrefix,userPermissions)

        try {
            let contextKey = ctx.request.body["context-key"] || ""
            let accessToken = ctx.request.body["access-token"] || ""
            if (accessToken === env.LIBERTY_FLAG_ACCESS_TOKEN) {
                if (contextKey !== "") {

                    let flagContextConfig = ctx.request.body["flag-config"] || ""
                    if (flagContextConfig !== "") {
                        let flag = await flagService.getByName(flagContextConfig.name)
                        let contextFound = false
                        flag.contexts.forEach(context => {
                            if (context.bucket_context_uuid === contextKey) {
                                contextFound=true
                                context.engine=flagContextConfig.engine
                                context.engine_parameters=flagContextConfig.engine_parameters
                            }
                        });
                        if (contextFound) {
                            let dbResultOk = await flagService.updateOne(flag)
                            if (dbResultOk) {
                                ctx.body = {
                                    status: 'success',
                                }                    
                            }
                            else {
                                ctx.status=500
                                ctx.body = {
                                    status: 'error',
                                    messages: [{message: "Data Unexpected Error"}]
                                }
                                console.log("DATABASE ERROR writing flag "+flag.name)
                            }                             
                        } else {
                            console.log('API - set-flag-config - '+flagContextConfig.name+' - No match for flag and context storage' )
                            ctx.status=400
                            ctx.body = {
                                status: 'error',
                                message: 'No match for flag and context storage'
                            }
                        }

                    } else {
                        console.log('API - set-flag-config - No valid Flag Definition' )
                        ctx.status=400
                        ctx.body = {
                            status: 'error',
                            message: 'No valid Flag Definition'
                        }
                    }
        
                    ctx.body = {
                        status: 'success'
                    }
                    
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
        } finally{
            flagService.dispose()
        }

    })

    return router
}