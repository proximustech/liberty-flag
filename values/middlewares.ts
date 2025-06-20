// @ts-ignore
import {MiddlewareManager} from 'js-middleware';
import { registeredPlugins } from "./registered_middleware_plugins";

let middlewareTargets:any = {}
let middlewareBaseManagers:any = {}

let middlewareServiceName = "RoutesMiddleware"
import {RoutesMiddleware} from "../services/RoutesMiddleware"
middlewareTargets[middlewareServiceName]=new RoutesMiddleware()
middlewareBaseManagers[middlewareServiceName] = new MiddlewareManager(middlewareTargets[middlewareServiceName])

middlewareServiceName = "BucketServiceCrudMiddleware"
import {BucketServiceCrudMiddleware} from "../services/BucketServiceCrudMiddleware"
middlewareTargets[middlewareServiceName]=new BucketServiceCrudMiddleware()
middlewareBaseManagers[middlewareServiceName] = new MiddlewareManager(middlewareTargets[middlewareServiceName])

middlewareServiceName = "FlagServiceCrudMiddleware"
import {FlagServiceCrudMiddleware} from "../services/FlagServiceCrudMiddleware"
middlewareTargets[middlewareServiceName]=new FlagServiceCrudMiddleware()
middlewareBaseManagers[middlewareServiceName] = new MiddlewareManager(middlewareTargets[middlewareServiceName])

middlewareServiceName = "BucketServiceFilterMiddleware"
import {BucketServiceFilterMiddleware} from "../services/BucketServiceFilterMiddleware"
middlewareTargets[middlewareServiceName]=new BucketServiceFilterMiddleware()
middlewareBaseManagers[middlewareServiceName] = new MiddlewareManager(middlewareTargets[middlewareServiceName])

middlewareServiceName = "FlagServiceFilterMiddleware"
import {FlagServiceFilterMiddleware} from "../services/FlagServiceFilterMiddleware"
middlewareTargets[middlewareServiceName]=new FlagServiceFilterMiddleware()
middlewareBaseManagers[middlewareServiceName] = new MiddlewareManager(middlewareTargets[middlewareServiceName])

let pluginMiddlewareInjector = undefined
for (const [pluginMiddlewareServiceName, value] of Object.entries(registeredPlugins)) {

    registeredPlugins[pluginMiddlewareServiceName].forEach((path: string) => {
        pluginMiddlewareInjector = require(path)
        //@ts-ignore
        pluginMiddlewareInjector.default.inject(middlewareBaseManagers[pluginMiddlewareServiceName])
    });

}

export let exposedMiddlewareTargets = middlewareTargets