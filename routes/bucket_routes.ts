import { Context } from "koa";
import Router from "koa-router"
import { BucketServiceFactory } from "../factories/BucketServiceFactory";
import { TagServiceFactory } from "../factories/TagServiceFactory";
import { BucketDataObject,BucketDataObjectValidator,BucketDataObjectSpecs } from "../dataObjects/BucketDataObject";
import { BucketContextDataObject,BucketContextDataObjectValidator,BucketContextDataObjectSpecs } from "../dataObjects/BucketDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { ExceptionCsrfTokenFailed,ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exceptions";
import { LoggerServiceFactory } from "../../../factories/LoggerServiceFactory";
import { RouteService } from "../../../services/route_service";
import { DataPulseManagerServiceFactory } from "../factories/DatePulseManagerServiceFactory";

import koaBody from 'koa-body';
import { FlagServiceFactory } from "../factories/FlagServiceFactory";

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    let logger = LoggerServiceFactory.create()

    router.get('/buckets', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())
            viewVars.buckets = await bucketService.getAll()

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.md.buckets_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/buckets', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                logger.error(error)
            }
        } finally{
            bucketService.dispose()
            tagService.dispose()

        }
    })

    router.get('/bucket_form', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let bucket:BucketDataObject = new BucketDataObject()

            viewVars.tags = await tagService.getAll()

            if (uuid !=="") {
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
            viewVars.bucketContextValidateFunction = "app.md.bucket_form.bucketContextValidateFunction=" + BucketContextDataObjectValidator.validateFunction

            viewVars.bucket = bucket
            viewVars.bucketMetadata = BucketDataObjectSpecs.metadata
            viewVars.bucketFieldRender = BucketDataObjectSpecs.htmlDataObjectFieldRender
            viewVars.bucketValidateSchema = BucketDataObjectValidator.validateSchema
            viewVars.bucketValidateFunction = "app.md.bucket_form.bucketValidateFunction=" + BucketDataObjectValidator.validateFunction
            //viewVars.bucketFieldsHtml = BucketDataObjectSpecs.htmlDataObjectRender(bucket,BucketDataObjectSpecs.metadata)

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.md.bucket_form.userHasPermissionOnElement=" +  UserHasPermissionOnElement
            RouteService.setCsrfToken(viewVars,ctx)

            return ctx.render('plugins/_'+prefix+'/views/bucket_form', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                logger.error(error)
            }
        } finally{
            tagService.dispose()
            bucketService.dispose()
        }
    })

    router.post('/bucket',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)

            const bucketService = BucketServiceFactory.create(prefix,userPermissions)
            try {

                if (ctx.request.body.csrfToken !== ctx.cookies.get("csrfToken")) {
                    throw new ExceptionCsrfTokenFailed(ExceptionCsrfTokenFailed.ExceptionCsrfTokenFailed);
                }

                let bucket = (JSON.parse(ctx.request.body.json) as BucketDataObject)

                let dbResultOk = false
                if (bucket.uuid !== "") {
                    dbResultOk = await bucketService.updateOne(bucket)
                } else {
                    dbResultOk = await bucketService.create(bucket)
                }
                if (dbResultOk) {
                    ctx.body = {
                        status: 'success',
                    }
                }
                else {
                    ctx.status=500
                    ctx.body = {
                        status: 'error',
                        messages: [{message: "Data Unexpected Error"}]
                    }
                    logger.error("DATABASE ERROR writing bucket "+bucket.uuid)                    
                }
       
            } catch (error) {
                if (error instanceof ExceptionNotAuthorized) {
                    ctx.status=401
                    ctx.body = {
                        status: 'error',
                        messages: [{message:"Operation NOT Allowed"}]
                    }         
                    logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.bucket')
                    
                }
                else if (error instanceof ExceptionRecordAlreadyExists) {
                    ctx.status=409
                    ctx.body = {
                        status: 'error',
                        messages: [{field:"name",message:"Name already exists"}]
                    }   
                    
                }
                else if (error instanceof ExceptionInvalidObject) {
                    ctx.status=400
                    ctx.body = {
                        status: 'error',
                        //@ts-ignore
                        messages: error.errorMessages
                    }
                    
                }
                else if (error instanceof ExceptionCsrfTokenFailed) {
                    ctx.status=401
                    ctx.body = {
                        status: 'error',
                        messages: [{message:"Operation NOT Allowed"}]
                    }         
                    logger.warn("SECURITY WARNING: Csrf Control Failed for user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.bucket')
                    
                }                  
                else {
                    logger.error(error)
    
                }                 
            } finally {
                bucketService.dispose()
            }
            

    })

    router.delete('/bucket',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
    
        const bucketService = BucketServiceFactory.create(prefix,userPermissions)
        try {

            if (ctx.request.query.csrfToken !== ctx.cookies.get("csrfToken")) {
                throw new ExceptionCsrfTokenFailed(ExceptionCsrfTokenFailed.ExceptionCsrfTokenFailed);
            }

            let uuid:any = ctx.request.query.uuid || ""

            if (uuid !=="") {
                let dbResultOk=false
                dbResultOk = await bucketService.deleteByUuId(uuid)    
                if (dbResultOk) {
                    ctx.body = {
                        status: 'success',
                    }
                }
                else {
                    ctx.status=500
                    ctx.body = {
                        status: 'error',
                        messages: [{message: "Data Unexpected Error"}]
                    }
                    logger.error("DATABASE ERROR deleting bucket "+uuid)                    
                } 
            }
            else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    message: "Invalid Uuid"
                }

            }                
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.bucket')
                
            }
            else if (error instanceof ExceptionCsrfTokenFailed) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: Csrf Control Failed for user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.bucket')
                
            }              
            else {
                logger.error(error)

            }  
        } finally {
            bucketService.dispose()
        }

    })

    router.get('/contexts', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            let buckets = await bucketService.getAll()

            const nameBucketContextMap = new Map<string, string>();

            for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
                const bucket = buckets[bucketIndex];
                bucket.contexts.forEach(context => {
                    nameBucketContextMap.set(context.name,bucket.uuid+","+context.uuid)
                    
                });
                
            }

            let contexts:any=[]
            nameBucketContextMap.forEach((value, key, map) => {
                contexts.push({ name: key,uuids:value})
            });            

            viewVars.contexts = contexts
            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.md.contexts_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/contexts', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                logger.error(error)

            }  
        } finally {
            bucketService.dispose()
        }
    })

    router.get('/context', async (ctx:Context) => {
        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,userPermissions)        
        const bucketService = BucketServiceFactory.create(prefix,userPermissions)
        const tagService = TagServiceFactory.create(prefix,userPermissions)
        try {

            let uuids:any = ctx.request.query.uuids || ""
            let bucketUuid = uuids.split(",")[0]
            let contextUuid = uuids.split(",")[1]
            let bucket = await bucketService.getByUuId(bucketUuid)
            let contextName = ""
            bucket.contexts.forEach(context => {
                if (context.uuid===contextUuid) {
                    contextName=context.name
                    
                }
            });

            let buckets = await bucketService.getAll()
            viewVars.matchedContextsUuids=[]

            for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
                const bucket = buckets[bucketIndex];
                bucket.contexts.forEach(context => {
                    if (context.name===contextName) {
                        viewVars.matchedContextsUuids.push(context.uuid)
                    }
                });
                
            }

            viewVars.bucketUuidMap = bucketService.getUuidMapFromList(await bucketService.getAll())
            viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())
            viewVars.contextName = contextName
            viewVars.flags = await flagService.getAll()
            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.md.context.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/context', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                logger.error(error)

            }  
        }
        finally{
            tagService.dispose()
            flagService.dispose()
            bucketService.dispose()
        }
    })

    router.get('/context_stats', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)

        try {

            let uuids:any = ctx.request.query.uuids || ""
            let bucketUuid = uuids.split(",")[0]
            let contextUuid = uuids.split(",")[1]
            let bucket = await bucketService.getByUuId(bucketUuid)
            let contextName = ""
            bucket.contexts.forEach(context => {
                if (context.uuid===contextUuid) {
                    contextName=context.name
                    
                }
            });

            let buckets = await bucketService.getAll()
            viewVars.matchedContextsUuids=[]

            for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
                const bucket = buckets[bucketIndex];
                bucket.contexts.forEach(context => {
                    if (context.name===contextName) {
                        viewVars.matchedContextsUuids.push([bucket.name,context.uuid])
                    }
                });
                
            }
            viewVars.dataPulseManager = DataPulseManagerServiceFactory.create()
            viewVars.contextName = contextName
            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/context_stats', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                logger.error(error)

            }  
        }
        finally{
            bucketService.dispose()
        }
    })    

    router.get('/context_data_pulse_stats', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)

        try {

            let uuids:any = ctx.request.query.uuids || ""
            let bucketUuid = uuids.split(",")[0]
            let contextUuid = uuids.split(",")[1]
            let bucket = await bucketService.getByUuId(bucketUuid)
            let contextName = ""
            bucket.contexts.forEach(context => {
                if (context.uuid===contextUuid) {
                    contextName=context.name
                    
                }
            });

            let buckets = await bucketService.getAll()
            viewVars.matchedContextsUuids=[]

            for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
                const bucket = buckets[bucketIndex];
                bucket.contexts.forEach(context => {
                    if (context.name===contextName) {
                        viewVars.matchedContextsUuids.push([bucket.name,context.uuid])
                    }
                });
                
            }
            viewVars.dataPulseManager = DataPulseManagerServiceFactory.create()
            viewVars.contextName = contextName
            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/context_data_pulse_stats', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                logger.error(error)

            }  
        }
        finally{
            bucketService.dispose()
        }
    })    

    return router
}