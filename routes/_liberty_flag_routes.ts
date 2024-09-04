import Router from "koa-router"
import { BucketService } from "../services/bucketService";
import { BucketDataObject,BucketDataObjectValidator,BucketDataObjectSpecs } from "../dataObjects/BucketDataObject";

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

    router.get('/bucket_create_form', async (ctx) => {
        try {
            let bucket = new BucketDataObject()
            viewVars.dataObjectHtml = BucketDataObjectSpecs.htmlDataObjectRender(bucket,BucketDataObjectSpecs.metadata)
            viewVars.bucket = bucket
            viewVars.validateSchema = JSON.stringify(BucketDataObjectValidator.validateSchema)
            viewVars.validateFunction = "app.module_data.bucket_form.validateFunction=" + BucketDataObjectValidator.validateFunction

            return ctx.render('plugins/_'+prefix+'/views/bucket_form', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    return router
}

export default getRouter