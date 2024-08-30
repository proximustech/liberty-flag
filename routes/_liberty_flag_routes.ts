import Router from "koa-router"
import { BucketService } from "../services/bucketService";
import koaBody from 'koa-body';

let getRouter = (viewVars: any) => {
    const prefix = 'liberty_flag'
    const router = new Router({prefix: '/'+ prefix});

    router.get('/buckets', async (ctx) => {
        try {
            const bucketService = new BucketService()
            viewVars.buckets = bucketService.getAll()
            return ctx.render('plugins/_'+prefix+'/views/buckets', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    return router
}

export default getRouter