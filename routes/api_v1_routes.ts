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

    /*
    router.get('/flags', async (ctx:Context) => {
        try {

            let bucketUuid:any = ctx.request.query.bucket_uuid || ""

            if (bucketUuid !=="") {
                const flagService = new FlagService()
                const bucketService = new BucketService()
                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                viewVars.flags = await flagService.getAllByBucketUuid(bucketUuid)
                return ctx.render('plugins/_'+prefix+'/views/flags', viewVars);
            }
            else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    message: "Invalid Uuid"
                }
    
            }

        } catch (error) {
            console.error(error)
        }
    })
    */

    router.post(apiPrefix+'/get_context_flags_data',koaBody(), async (ctx:Context) => {
        let contextKey = ctx.request.body["context-key"] || ""

        if (contextKey !== "") {
            console.log(contextKey)

            const flagService = new FlagService()

            let responseFlags:any = []
            let flags:Array<FlagDataObject> = await flagService.getAllByContextUuid(contextKey)
    
            flags.forEach(flag => {
    
                flag.contexts.forEach(context => {
                    if(context.bucket_context_uuid === contextKey ){
                        responseFlags.push({
                            name:flag.name,
                            engine:context.engine,
                            parameters:context.engine_parameters[context.engine]
                        })
    
                    }
                    
                });
    
            });            

            ctx.body = {
                status: 'success',
                flags: responseFlags
            }
            
        } else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                message: 'No valid Context Key'
            }
            
        }

    })

    return router
}