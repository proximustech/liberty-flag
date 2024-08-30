import Router from "koa-router"
import koaBody from 'koa-body';

let getRouter = (viewVars: any) => {
    const prefix = 'liberty_flag'
    const router = new Router({prefix: '/'+ prefix});

    router.get('/projects', async (ctx) => {
        try {
            return ctx.render('plugins/_'+prefix+'/views/projects', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    return router
}

export default getRouter