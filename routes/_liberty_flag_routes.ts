import Router from "koa-router"
import { exposedMiddlewareTargets as middlewareTargets } from "../values/middlewares"

let getRouter = (appViewVars: any) => {
    const prefix = 'liberty_flag'
    let router = new Router({prefix: '/'+ prefix});

    router = require("./bucket_routes.ts")(router,appViewVars,prefix)
    router = require("./tag_routes.ts")(router,appViewVars,prefix)
    router = require("./flag_routes.ts")(router,appViewVars,prefix)
    router = require("./api_v1_routes.ts")(router,appViewVars,prefix)
    let routerData:any = {
        router:router,
        appViewVars:appViewVars,
        prefix:prefix

    }
    routerData = middlewareTargets["RoutesMiddleware"].feedRouter(routerData)

    return routerData.router
}

export default getRouter