import Router from "koa-router"
import { BucketService } from "../services/BucketService";
import { BucketDataObject,BucketDataObjectValidator,BucketDataObjectSpecs } from "../dataObjects/BucketDataObject";
import { BucketContextDataObject,BucketContextDataObjectValidator,BucketContextDataObjectSpecs } from "../dataObjects/BucketDataObject";

import koaBody from 'koa-body';

let getRouter = (viewVars: any) => {
    const prefix = 'liberty_flag'
    const router = new Router({prefix: '/'+ prefix});
    viewVars.prefix = prefix

    router.get('/buckets', async (ctx) => {
        try {
            const bucketService = new BucketService()
            viewVars.buckets = await bucketService.getAll()
            return ctx.render('plugins/_'+prefix+'/views/buckets', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    router.get('/bucket_form', async (ctx) => {
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let bucket:BucketDataObject = new BucketDataObject()

            if (uuid !=="") {
                const bucketService = new BucketService()
                bucket = await bucketService.getByUuId(uuid) 
                
            }
            else {
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

    router.post('/bucket',koaBody(), async (ctx) => {
        const bucketService = new BucketService()
        let bucket = (ctx.request.body as BucketDataObject)
        if (bucket.uuid !== "") {
            bucketService.updateOne(bucket) 
        } else {
            bucketService.create(bucket)
        }
        ctx.body = {
            status: 'success',
        }

    })

    return router
}

export default getRouter