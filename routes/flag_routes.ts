import Router from "koa-router"
import { Context } from "koa";
import { FlagServiceFactory } from "../factories/FlagServiceFactory";
import { BucketService } from "../services/BucketService";
import { BucketServiceFactory } from "../factories/BucketServiceFactory";
import { TagServiceFactory } from "../factories/TagServiceFactory";
import { FlagDataObject,FlagDataObjectValidator,FlagDataObjectSpecs, FlagContextDataObject } from "../dataObjects/FlagDataObject";
import { EngineBooleanConditionedDataObject,EngineBooleanConditionedConditionDataObject,EngineBooleanConditionedConditionDataObjectValidator } from "../dataObjects/EngineBooleanConditionedDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exception_custom_errors";
import { LoggerServiceFactory } from "../../../factories/LoggerServiceFactory";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    let logger = LoggerServiceFactory.create()

    router.get('/flags', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,viewVars.userPermissions)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            let bucketUuid:any = ctx.request.query.bucket_uuid || ""

            if (bucketUuid !=="") {

                viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())

                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                viewVars.getUuidMapFromBucketContextsList = BucketService.getUuidMapFromContextsList
                viewVars.flags = await flagService.getAllByBucketUuid(bucketUuid)

                viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
                viewVars.userHasPermissionOnElement = "app.md.flags_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement         

                return ctx.render('plugins/_'+prefix+'/views/flags', viewVars);
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
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.flag')
                
            }
            else {
                logger.error(error)
            }
        } finally{
            bucketService.dispose()
            flagService.dispose()
            tagService.dispose()
        }
    })

    router.get('/flag_form', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        const flagService = FlagServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let bucketUuid:any = ctx.request.query.bucket_uuid || ""
            viewVars.bucketContextUuid = ctx.request.query.bucket_context_uuid || "" // Used to open context automatically
            if (bucketUuid !== "") {
                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                
                let flag:FlagDataObject = new FlagDataObject()
                viewVars.tags = await tagService.getAll()

                if (uuid !=="") {
    
                    flag = await flagService.getByUuId(uuid) 
                    viewVars.editing = true
                    
                }
                else {
                    flag.bucket_uuid=bucketUuid
                    viewVars.editing = false
                }

                viewVars.flagContextsUuids = []
                flag.contexts.forEach(flagContext => {
                    viewVars.flagContextsUuids.push(flagContext.bucket_context_uuid)
                });
    
                viewVars.flag = flag
                viewVars.flagMetadata = FlagDataObjectSpecs.metadata
                viewVars.flagFieldRender = FlagDataObjectSpecs.htmlDataObjectFieldRender
                viewVars.flagValidateSchema = FlagDataObjectValidator.validateSchema
                viewVars.flagValidateFunction = "app.md.flag_form.flagValidateFunction=" + FlagDataObjectValidator.validateFunction

                let flagContext = new FlagContextDataObject()
                viewVars.flagContext = flagContext

                //viewVars.engineBoolean = new EngineBooleanDataObject(false)
                //viewVars.engineBooleanMetadata = EngineBooleanDataObjectSpecs.metadata
                //viewVars.engineBooleanFieldRender = EngineBooleanDataObjectSpecs.htmlDataObjectFieldRender
                //viewVars.engineBooleanValidateSchema = EngineBooleanDataObjectValidator.validateSchema
                //viewVars.engineBooleanValidateFunction = "app.md.flag_form.engineBooleanValidateFunction=" + EngineBooleanDataObjectValidator.validateFunction
                                
                viewVars.engineBooleanConditioned = new EngineBooleanConditionedDataObject()
                viewVars.engineBooleanConditionedCondition = new EngineBooleanConditionedConditionDataObject()
                viewVars.engineBooleanConditionedConditionValidateShema = EngineBooleanConditionedConditionDataObjectValidator.validateSchema
                viewVars.engineBooleanConditionedConditionValidateFunction = "app.md.flag_form.engineBooleanConditionedConditionValidateFunction=" + EngineBooleanConditionedConditionDataObjectValidator.validateFunction                

                viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
                viewVars.userHasPermissionOnElement = "app.md.flag_form.userHasPermissionOnElement=" +  UserHasPermissionOnElement                            

                return ctx.render('plugins/_'+prefix+'/views/flag_form', viewVars);
                
            } else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    messages: "Invalid bucket uuid"
                }
                
            }

        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.flag')
                
            }
            else {
                logger.error(error)
            }
        } finally{
            bucketService.dispose()
            tagService.dispose()
            flagService.dispose()
        }
    })

    router.post('/flag',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,userPermissions)

        try {
            let flag = (JSON.parse(ctx.request.body.json) as FlagDataObject)
    
            let dbResultOk = false
            if (flag.uuid !== "") {
                dbResultOk = await flagService.updateOne(flag) 
            } else {
                dbResultOk = await flagService.create(flag)
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
                logger.error("DATABASE ERROR writing flag "+flag.uuid)
            }  
                         
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.flag')
                
            }
            else if (error instanceof ExceptionRecordAlreadyExists) {
                ctx.status=409
                ctx.body = {
                    status: 'error',
                    messages: [{field:"email",message:"Name already exists"}]
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
                logger.error(error)

            }              
        } finally{
            flagService.dispose() 
        }
  

    })

    router.delete('/flag',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,userPermissions)

        try {
            let uuid:any = ctx.request.query.uuid || ""

            if (uuid !=="") {
                let dbResultOk = false
                dbResultOk = await flagService.deleteByUuId(uuid)
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
                    logger.error("DATABASE ERROR deleting flag "+uuid)                    
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
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.flag')
                
            }
            else {
                logger.error(error)

            }              
        } finally {
            flagService.dispose()            

        }

    })

    return router
}