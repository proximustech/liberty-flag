import Router from "koa-router"
import { FlagService } from "../services/FlagService";
import { BucketService } from "../services/BucketService";
import { FlagDataObject,FlagDataObjectValidator,FlagDataObjectSpecs, FlagContextDataObject } from "../dataObjects/FlagDataObject";

import koaBody from 'koa-body';

module.exports = function(router:Router,viewVars:any,prefix:string){


    router.get('/flags', async (ctx) => {
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
                    messate: "Invalid Uuid"
                }
    
            }

        } catch (error) {
            console.error(error)
        }
    })

    router.get('/flag_form', async (ctx) => {
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let bucketUuid:any = ctx.request.query.bucket_uuid || ""
            if (bucketUuid !== "") {
                const bucketService = new BucketService()
                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                
                let flag:FlagDataObject = new FlagDataObject()

                if (uuid !=="") {
    
                    const flagService = new FlagService()
                    flag = await flagService.getByUuId(uuid) 
                    viewVars.editing = true
                    
                }
                else {
                    flag.bucket_uuid=bucketUuid
                    viewVars.editing = false
                }
    
                viewVars.flag = flag
                viewVars.flagMetadata = FlagDataObjectSpecs.metadata
                viewVars.flagFieldRender = FlagDataObjectSpecs.htmlDataObjectFieldRender
                viewVars.flagValidateSchema = FlagDataObjectValidator.validateSchema
                viewVars.flagValidateFunction = "app.module_data.flag_form.flagValidateFunction=" + FlagDataObjectValidator.validateFunction

                let flagContext = new FlagContextDataObject()
                viewVars.flagContext = flagContext
    
                return ctx.render('plugins/_'+prefix+'/views/flag_form', viewVars);
                
            } else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    messages: "Invalid bucket uuid"
                }
                
            }

        } catch (error) {
            console.error(error)
        }
    })

    router.post('/flag',koaBody(), async (ctx) => {
        const flagService = new FlagService()
        let flag = (JSON.parse(ctx.request.body.json) as FlagDataObject)

        let flagValidationResult=FlagDataObjectValidator.validateFunction(flag,FlagDataObjectValidator.validateSchema)
        if (flagValidationResult.isValid) {
            if (flag.uuid !== "") {
                flagService.updateOne(flag) 
            } else {
                flagService.create(flag)
            }
            ctx.body = {
                status: 'success',
            }
            
        } else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                messages: flagValidationResult.messages
            }
            
        }

    })

    router.delete('/flag',koaBody(), async (ctx) => {
        const flagService = new FlagService()

        let uuid:any = ctx.request.query.uuid || ""

        if (uuid !=="") {
            await flagService.deleteByUuId(uuid)    
            ctx.body = {
                status: 'success',
            }
        }
        else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                messate: "Invalid Uuid"
            }

        }

    })


    return router
}