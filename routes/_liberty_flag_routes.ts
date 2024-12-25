import Router from "koa-router"

let getRouter = (appViewVars: any) => {
    const prefix = 'liberty_flag'
    let router = new Router({prefix: '/'+ prefix});

    router = require("./bucket_routes.ts")(router,appViewVars,prefix)
    router = require("./tag_routes.ts")(router,appViewVars,prefix)
    router = require("./flag_routes.ts")(router,appViewVars,prefix)
    router = require("./api_v1_routes.ts")(router,appViewVars,prefix)

    return router
}

export default getRouter