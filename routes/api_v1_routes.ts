import Router from "koa-router"
import { Context } from "koa";
import { FlagServiceFactory } from "../factories/FlagServiceFactory";
import { FlagDataObject } from "../dataObjects/FlagDataObject";
import { env } from 'node:process';
import { ExceptionNotAuthorized,ExceptionInvalidObject } from "../../../types/exception_custom_errors";
import { LoggerServiceFactory } from "../../../factories/LoggerServiceFactory";
import { FlagEngineService } from "../services/FlagEngineService";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let apiPrefix = "/api/v1"
    let apiSecurityPrefix="liberty_flag" //Must be the same value of the Liberty Flag prefix in the _liberty_flag_routes.ts file.

    let logger = LoggerServiceFactory.create()

    router.post(apiPrefix+'/get-flags-config',koaBody(), async (ctx:Context) => {

        let userPermissions:any = [['','liberty_flag.flag','read']]
        const flagService = FlagServiceFactory.create(apiSecurityPrefix,userPermissions)

        try {
            let contextKey = ctx.request.body["context-key"] || ""
            let accessToken = ctx.request.body["access-token"] || ""
            if (accessToken === env.LIBERTY_FLAG_READ_ACCESS_TOKEN || accessToken === env.LIBERTY_FLAG_WRITE_ACCESS_TOKEN) {
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
                        logger.warn('API - get-flags-config - No flags for Context Key: "'+ contextKey + '"' )
                    }
        
                    ctx.body = {
                        status: 'success',
                        flags: responseFlags
                    }
                    
                } else {
                    logger.warn('API - get-flags-config - No valid Context Key: "'+ contextKey + '"' )
                    ctx.status=400
                    ctx.body = {
                        status: 'error',
                        message: 'No valid Context Key'
                    }
                    
                }            
            }
            else {
                logger.warn('API - get-flags-config - Invalid Access Token: "'+ accessToken + '"' )
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
                logger.warn("SECURITY WARNING: unauthorized user traying to READ on " + prefix +'.flag')
                
            }

            else {
                logger.error(error)

            }               
        } finally{
            flagService.dispose()
        }

    })

    router.post(apiPrefix+'/get-flag-value',koaBody(), async (ctx:Context) => {

        let userPermissions:any = [['','liberty_flag.flag','read']]
        const flagService = FlagServiceFactory.create(apiSecurityPrefix,userPermissions)

        try {
            let name = ctx.request.body["name"] || ""
            let contextKey = ctx.request.body["context-key"] || ""
            let accessToken = ctx.request.body["access-token"] || ""
            if (accessToken === env.LIBERTY_FLAG_READ_ACCESS_TOKEN || accessToken === env.LIBERTY_FLAG_WRITE_ACCESS_TOKEN) {
                if (contextKey !== "" && name !== "") {    
        
                    let returnValue:any = []
                    let flag:FlagDataObject = await flagService.getByNameAndContextKey(name,contextKey)
            
                    if (flag.uuid === "") {
                        logger.warn(`API - get-flag-value - No flag for Context Key and name: ${contextKey} and ${name}` )

                        ctx.status=400
                        ctx.body = {
                            status: 'error',
                            message: 'No valid Context Key and Name'
                        }                        
                    }
                    else {

                        flag.contexts.forEach(context => {
                            if(context.bucket_context_uuid === contextKey ){

                                if (context.engine !== "boolean" && context.engine !== "string") {
                                    logger.warn(`API - get-flag-value - No flag for Context Key and name: ${contextKey} and ${name}` )

                                    ctx.status=400
                                    ctx.body = {
                                        status: 'error',
                                        message: 'No valid Context Key and Name'
                                    }                                      
                                }
                                else {
                                    returnValue = FlagEngineService.getValueFromContext(context)
                                    ctx.body = {
                                        status: 'success',
                                        value: returnValue
                                    }
                                }
                            }                        
                        });


                    }

                } else {
                    logger.warn(`API - get-flag-value - No valid Context Key and Name: ${contextKey} and ${name}` )
                    ctx.status=400
                    ctx.body = {
                        status: 'error',
                        message: 'No valid Context Key and Name'
                    }
                    
                }            
            }
            else {
                logger.warn('API - get-flags-config - Invalid Access Token: "'+ accessToken + '"' )
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
                logger.warn("SECURITY WARNING: unauthorized user traying to READ on " + prefix +'.flag')
                
            }

            else {
                logger.error(error)

            }               
        } finally{
            flagService.dispose()
        }

    })

    router.post(apiPrefix+'/set-flags-config',koaBody(), async (ctx:Context) => {

        let userPermissions:any = [['','liberty_flag.flag','read'],['','liberty_flag.flag','write']]
        const flagService = FlagServiceFactory.create(apiSecurityPrefix,userPermissions)

        try {
            let contextKey = ctx.request.body["context-key"] || ""
            let accessToken = ctx.request.body["access-token"] || ""
            if (accessToken === env.LIBERTY_FLAG_WRITE_ACCESS_TOKEN) {
                if (contextKey !== "") {

                    let flagsContextConfig = ctx.request.body["flags-config"] || ""
                    if (flagsContextConfig !== "") {
                        let contextConfigUpdated = await flagService.updateFlagsContextConfig(contextKey,flagsContextConfig)
                        if (!contextConfigUpdated) {
                            logger.warn('API - set-flags-config - '+flagsContextConfig.name+' - No match for flags and context storage' )
                            ctx.status=400
                            ctx.body = {
                                status: 'error',
                                message: 'No match for flags and context storage'
                            }
                        }
                        else{
                            ctx.body = {
                                status: 'success'
                            }
                        }

                    } else {
                        logger.warn('API - set-flags-config - No valid Flag Definition' )
                        ctx.status=400
                        ctx.body = {
                            status: 'error',
                            message: 'No valid Flag Definition'
                        }
                    }
                    
                } else {
                    logger.warn('API - set-flags-config - No valid Context Key: "'+ contextKey + '"' )
                    ctx.status=400
                    ctx.body = {
                        status: 'error',
                        message: 'No valid Context Key'
                    }
                    
                }            
            }
            else {
                logger.warn('API - set_flags_config - Invalid Access Token: "'+ accessToken + '"' )
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
                logger.warn("SECURITY WARNING: unauthorized user traying to READ on " + prefix +'.flag')
                
            }
            else if (error instanceof ExceptionInvalidObject) {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    //@ts-ignore
                    messages: error.errorMessages
                }
                
            }
            else {
                logger.error(error)

            }               
        } finally{
            flagService.dispose()
        }

    })

    return router
}