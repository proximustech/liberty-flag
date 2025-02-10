import { Context } from "koa";
import Router from "koa-router"
import { Uuid } from "../../../services/utilities";
import { BucketService } from "../services/BucketService";
import { FlagService } from "../services/FlagService";
import { TagService } from "../services/TagService";
import { BucketDataObject,BucketDataObjectValidator,BucketDataObjectSpecs } from "../dataObjects/BucketDataObject";
import { BucketContextDataObject,BucketContextDataObjectValidator,BucketContextDataObjectSpecs } from "../dataObjects/BucketDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exception_custom_errors";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    router.get('/buckets', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = new TagService(prefix,viewVars.userPermissions)
        const bucketService = new BucketService(prefix,viewVars.userPermissions)
        try {

            viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())
            viewVars.buckets = await bucketService.getAll()

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.module_data.buckets_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/buckets', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                console.error(error)
            }
        } finally{
            bucketService.dispose()
            tagService.dispose()

        }
    })

    router.get('/bucket_form', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = new TagService(prefix,viewVars.userPermissions)
        const bucketService = new BucketService(prefix,viewVars.userPermissions)
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
            viewVars.bucketContextValidateFunction = "app.module_data.bucket_form.bucketContextValidateFunction=" + BucketContextDataObjectValidator.validateFunction

            viewVars.bucket = bucket
            viewVars.bucketMetadata = BucketDataObjectSpecs.metadata
            viewVars.bucketFieldRender = BucketDataObjectSpecs.htmlDataObjectFieldRender
            viewVars.bucketValidateSchema = BucketDataObjectValidator.validateSchema
            viewVars.bucketValidateFunction = "app.module_data.bucket_form.bucketValidateFunction=" + BucketDataObjectValidator.validateFunction
            //viewVars.bucketFieldsHtml = BucketDataObjectSpecs.htmlDataObjectRender(bucket,BucketDataObjectSpecs.metadata)

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.module_data.bucket_form.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/bucket_form', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                console.error(error)
            }
        } finally{
            tagService.dispose()
            bucketService.dispose()
        }
    })

    router.post('/bucket',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)

            const bucketService = new BucketService(prefix,userPermissions)
            try {
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
                    console.log("DATABASE ERROR writing bucket "+bucket.uuid)                    
                }
       
            } catch (error) {
                if (error instanceof ExceptionNotAuthorized) {
                    ctx.status=401
                    ctx.body = {
                        status: 'error',
                        messages: [{message:"Operation NOT Allowed"}]
                    }         
                    console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.bucket')
                    
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
                else {
                    console.error(error)
    
                }                 
            } finally {
                bucketService.dispose()
            }
            

    })

    router.delete('/bucket',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
    
        const bucketService = new BucketService(prefix,userPermissions)
        try {
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
                    console.log("DATABASE ERROR deleting bucket "+uuid)                    
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
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.bucket')
                
            }
            else {
                console.error(error)

            }  
        } finally {
            bucketService.dispose()
        }

    })

    router.get('/contexts', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const bucketService = new BucketService(prefix,viewVars.userPermissions)
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
            viewVars.userHasPermissionOnElement = "app.module_data.contexts_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/contexts', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                console.error(error)

            }  
        } finally {
            bucketService.dispose()
        }
    })

    router.get('/context', async (ctx:Context) => {
        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = new FlagService(prefix,userPermissions)        
        const bucketService = new BucketService(prefix,userPermissions)
        const tagService = new TagService(prefix,userPermissions)
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
            viewVars.userHasPermissionOnElement = "app.module_data.context.userHasPermissionOnElement=" +  UserHasPermissionOnElement

            return ctx.render('plugins/_'+prefix+'/views/context', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.bucket')
                
            }
            else {
                console.error(error)

            }  
        }
        finally{
            tagService.dispose()
            flagService.dispose()
            bucketService.dispose()
        }
    })    

    return router
}