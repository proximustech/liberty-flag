import Router from "koa-router"
import { Context } from "koa";
import { FlagServiceFactory } from "../factories/FlagServiceFactory";
import { BucketService } from "../services/BucketService";
import { BucketServiceFactory } from "../factories/BucketServiceFactory";
import { TagServiceFactory } from "../factories/TagServiceFactory";
import { FlagDataObject,FlagDataObjectValidator,FlagDataObjectSpecs, FlagContextDataObject } from "../dataObjects/FlagDataObject";
import { EngineBooleanConditionedDataObject,EngineBooleanConditionedConditionDataObject,EngineBooleanConditionedConditionDataObjectValidator } from "../dataObjects/EngineBooleanConditionedDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { ExceptionSessionInvalid,ExceptionCsrfTokenFailed,ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exceptions";
import { LoggerServiceFactory } from "../../../factories/LoggerServiceFactory";
import { RouteService } from "../../../services/route_service";
import { DynamicViews } from "../../../services/dynamic_views_service";
import { dynamicViewsDefinition } from "../values/dynamic_views"
import { exposedMiddlewareTargets as middlewareTargets } from "../values/middlewares"

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    let logger = LoggerServiceFactory.create()

    router.get('/flags', async (ctx:Context) => {

        if (typeof(ctx.session.passport.user)==="undefined") {
            throw new ExceptionSessionInvalid(ExceptionSessionInvalid.exceptionSessionInvalid);
        }

        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,viewVars.userPermissions)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            let bucketUuid:any = ctx.request.query.bucket_uuid || ""

            let filter:any = {}
            if (bucketUuid !=="") {
                filter = {bucket_uuid:bucketUuid}

            }
            viewVars.extendedFilterDefinition=""
            let extendedFilter:any = ctx.request.query.extended_filter || ""
            if (extendedFilter !== "") {
                let filterData:any = {}
                filterData.extendedFilter=extendedFilter
                filterData.filter = filter
                filterData.userPermissions = viewVars.userPermissions
                filterData=middlewareTargets["FlagServiceFilterMiddleware"].setFilter(filterData)
                filter=filterData.filter
                viewVars.extendedFilterDefinition = "extended_filter="+extendedFilter+"&"
            }            

            let searchValue:any = ctx.request.query.search_value || ""
            let listRegistersNumber:number = parseInt(ctx.request.query.list_registers_number as string) || 10
            let listPageNumber:number = parseInt(ctx.request.query.list_page_number as string) || 1            

            if(Object.keys(filter).length > 0){

                if (searchValue !== "") {
                    filter["name"] = searchValue
                }                
    
                let documentsCount:number = await flagService.getCount(filter)
                viewVars.listPagesTotalNumber= Math.ceil(documentsCount / listRegistersNumber)
                let skipRegistersNumber = (listPageNumber * listRegistersNumber) - listRegistersNumber
    
                viewVars.listPageNumber = listPageNumber
                viewVars.searchValue = searchValue
                viewVars.flags = await flagService.getAll(filter,listRegistersNumber,skipRegistersNumber)
                viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())
                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                viewVars.getUuidMapFromBucketContextsList = BucketService.getUuidMapFromContextsList
                
                viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
                viewVars.userHasPermissionOnElement = "app.md.flags_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement         

                return ctx.render('plugins/_'+prefix+'/views/flags', viewVars);
            }
            else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    message: "Empty Parent Uuid or Owners"
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

        if (typeof(ctx.session.passport.user)==="undefined") {
            throw new ExceptionSessionInvalid(ExceptionSessionInvalid.exceptionSessionInvalid);
        }

        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const bucketService = BucketServiceFactory.create(prefix,viewVars.userPermissions)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        const flagService = FlagServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            viewVars.bucketContextUuid = ctx.request.query.bucket_context_uuid || "" // Used to open context automatically
            let uuid:any = ctx.request.query.uuid || ""
            let bucketUuid:any = ctx.request.query.bucket_uuid || ""
            if (bucketUuid !== "" || uuid !== "" ) {
                
                let flag:FlagDataObject = new FlagDataObject()
                viewVars.pluginOperations = ""
                await DynamicViews.addViewVarContent(dynamicViewsDefinition,"flag_form","pluginOperations",viewVars,ctx)                            
                viewVars.tags = await tagService.getAll()

                if (uuid !=="") {
    
                    flag = await flagService.getByUuId(uuid) 
                    viewVars.editing = true
                    flag=await middlewareTargets["FlagServiceCrudMiddleware"].beforeFormShow(flag)
                    
                }
                else {
                    flag.bucket_uuid=bucketUuid
                    viewVars.editing = false
                }
                viewVars.bucket = await bucketService.getByUuId(flag.bucket_uuid)

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
                RouteService.setCsrfToken(viewVars,ctx)

                return ctx.render('plugins/_'+prefix+'/views/flag_form', viewVars);
                
            } else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    messages: "Empty Parent Uuid or Owners"
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

        if (typeof(ctx.session.passport.user)==="undefined") {
            throw new ExceptionSessionInvalid(ExceptionSessionInvalid.exceptionSessionInvalid);
        }

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,userPermissions)

        try {

            if (ctx.request.body.csrfToken !== ctx.cookies.get("csrfToken")) {
                throw new ExceptionCsrfTokenFailed(ExceptionCsrfTokenFailed.ExceptionCsrfTokenFailed);
            }

            let flag = (JSON.parse(ctx.request.body.json) as FlagDataObject)
    
            let dbResultOk = false
            if (flag.uuid !== "") {
                dbResultOk = await flagService.updateOne(flag) 
            } else {
                dbResultOk = true
                let createdFlagUuid = await flagService.create(flag)
                if (createdFlagUuid === "false") {
                    dbResultOk = false
                }                
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
            else if (error instanceof ExceptionCsrfTokenFailed) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: Csrf Control Failed for user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.flag')
                
            }               
            else {
                logger.error(error)

            }              
        } finally{
            flagService.dispose() 
        }
  

    })

    router.delete('/flag',koaBody(), async (ctx:Context) => {

        if (typeof(ctx.session.passport.user)==="undefined") {
            throw new ExceptionSessionInvalid(ExceptionSessionInvalid.exceptionSessionInvalid);
        }

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const flagService = FlagServiceFactory.create(prefix,userPermissions)

        try {

            if (ctx.request.query.csrfToken !== ctx.cookies.get("csrfToken")) {
                throw new ExceptionCsrfTokenFailed(ExceptionCsrfTokenFailed.ExceptionCsrfTokenFailed);
            }

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
            else if (error instanceof ExceptionCsrfTokenFailed) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: Csrf Control Failed for user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.flag')
                
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