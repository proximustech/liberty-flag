import { Context } from "koa";
import Router from "koa-router"
import { Uuid } from "../../../services/utilities";
import { BucketService } from "../services/BucketService";
import { TagService } from "../services/TagService";
import { BucketDataObject,BucketDataObjectValidator,BucketDataObjectSpecs } from "../dataObjects/BucketDataObject";
import { BucketContextDataObject,BucketContextDataObjectValidator,BucketContextDataObjectSpecs } from "../dataObjects/BucketDataObject";

import koaBody from 'koa-body';

module.exports = function(router:Router,viewVars:any,prefix:string){


    router.get('/buckets', async (ctx:Context) => {
        try {
            viewVars.prefix=prefix
            const tagService = new TagService()
            viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())
            const bucketService = new BucketService()
            viewVars.buckets = await bucketService.getAll()
            return ctx.render('plugins/_'+prefix+'/views/buckets', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    router.get('/bucket_form', async (ctx:Context) => {
        try {
            viewVars.prefix=prefix
            let uuid:any = ctx.request.query.uuid || ""
            let bucket:BucketDataObject = new BucketDataObject()

            const tagService = new TagService()
            viewVars.tags = await tagService.getAll()

            if (uuid !=="") {
                const bucketService = new BucketService()
                bucket = await bucketService.getByUuId(uuid) 
                viewVars.editing = true
                
            }
            else {
                viewVars.editing = false
                let bucketContext_dev = new BucketContextDataObject()
                bucketContext_dev.name="Development"
                bucket.contexts.push(bucketContext_dev)
    
                let bucketContext_qa = new BucketContextDataObject()
                bucketContext_qa.name="Quality"
                bucket.contexts.push(bucketContext_qa)
    
                let bucketContext_prod = new BucketContextDataObject()
                bucketContext_prod.name="Production"
                bucket.contexts.push(bucketContext_prod)
            }

            let bucketContext = new BucketContextDataObject()
            viewVars.bucketContext = bucketContext
            viewVars.bucketContextMetadata = BucketContextDataObjectSpecs.metadata
            viewVars.bucketContextValidateSchema = BucketContextDataObjectValidator.validateSchema
            viewVars.bucketContextValidateFunction = "app.module_data.bucket_form.bucketContextValidateFunction=" + BucketContextDataObjectValidator.validateFunction

            viewVars.bucket = bucket
            viewVars.bucketMetadata = BucketDataObjectSpecs.metadata
            viewVars.bucketFieldRender = BucketDataObjectSpecs.htmlDataObjectFieldRender
            viewVars.bucketValidateSchema = BucketDataObjectValidator.validateSchema
            viewVars.bucketValidateFunction = "app.module_data.bucket_form.bucketValidateFunction=" + BucketDataObjectValidator.validateFunction
            //viewVars.bucketFieldsHtml = BucketDataObjectSpecs.htmlDataObjectRender(bucket,BucketDataObjectSpecs.metadata)

            return ctx.render('plugins/_'+prefix+'/views/bucket_form', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    router.post('/bucket',koaBody(), async (ctx:Context) => {
        const bucketService = new BucketService()
        let bucket = (JSON.parse(ctx.request.body.json) as BucketDataObject)

        let bucketValidationResult=BucketDataObjectValidator.validateFunction(bucket,BucketDataObjectValidator.validateSchema)
        bucket.contexts.forEach(context => {
            //Validation
            let contextValidationResult=BucketContextDataObjectValidator.validateFunction(context,BucketContextDataObjectValidator.validateSchema)
            if (!contextValidationResult.isValid) {
                bucketValidationResult.isValid = false
                bucketValidationResult.messages = bucketValidationResult.messages.concat(contextValidationResult.messages)

            }

            //Assign uuid to new contexts
            if (context.uuid ==="") {
                context.uuid = Uuid.createMongoUuId()
            } else {
                //TODO: the uuid already exists
                
            }
            
        });

        if (bucketValidationResult.isValid) {
            if (bucket.uuid !== "") {
                bucketService.updateOne(bucket) 
            } else {
                bucketService.create(bucket)
            }
            ctx.body = {
                status: 'success',
            }
            
        } else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                messages: bucketValidationResult.messages
            }
            
        }

    })

    router.delete('/bucket',koaBody(), async (ctx:Context) => {
        const bucketService = new BucketService()

        let uuid:any = ctx.request.query.uuid || ""

        if (uuid !=="") {
            await bucketService.deleteByUuId(uuid)    
            ctx.body = {
                status: 'success',
            }
        }
        else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                message: "Invalid Uuid"
            }

        }

    })

    return router
}