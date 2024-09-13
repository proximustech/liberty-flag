import Router from "koa-router"

let getRouter = (viewVars: any) => {
    const prefix = 'liberty_flag'
    let router = new Router({prefix: '/'+ prefix});
    viewVars.prefix = prefix

    router = require("./bucket_routes.ts")(router,viewVars,prefix)
    router = require("./tag_routes.ts")(router,viewVars,prefix)
    router = require("./flag_routes.ts")(router,viewVars,prefix)

    return router
}

export default getRouter