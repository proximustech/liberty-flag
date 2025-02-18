import { Context } from "koa";
import Router from "koa-router"
import { TagServiceFactory } from "../factories/TagServiceFactory";
import { TagDataObject,TagDataObjectValidator,TagDataObjectSpecs } from "../dataObjects/TagDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { ExceptionCsrfTokenFailed,ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exception_custom_errors";
import { LoggerServiceFactory } from "../../../factories/LoggerServiceFactory";
import { RouteService } from "../../../services/route_service";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    let logger = LoggerServiceFactory.create()

    router.get('/tags', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            viewVars.tags = await tagService.getAll()

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.md.tags_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement         

            return ctx.render('plugins/_'+prefix+'/views/tags', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.tag')
                
            }
            else {
                logger.error(error)
            }
        } finally {
            tagService.dispose()

        }
    })
    
    router.get('/tag_form', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = TagServiceFactory.create(prefix,viewVars.userPermissions)
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let tag:TagDataObject = new TagDataObject()

            if (uuid !=="") {
                tag = await tagService.getByUuId(uuid) 
                viewVars.editing = true
                
            }
            else {
                viewVars.editing = false
            }

            viewVars.tag = tag
            viewVars.tagMetadata = TagDataObjectSpecs.metadata
            viewVars.tagFieldRender = TagDataObjectSpecs.htmlDataObjectFieldRender
            viewVars.tagValidateSchema = TagDataObjectValidator.validateSchema
            viewVars.tagValidateFunction = "app.md.tag_form.tagValidateFunction=" + TagDataObjectValidator.validateFunction

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.md.tag_form.userHasPermissionOnElement=" +  UserHasPermissionOnElement            
            RouteService.setCsrfToken(viewVars,ctx)

            return ctx.render('plugins/_'+prefix+'/views/tag_form', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.tag')
                
            }
            else {
                logger.error(error)
            }
        } finally {
            tagService.dispose()

        }
    })

    router.post('/tag',koaBody(), async (ctx:Context) => {
        
        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = TagServiceFactory.create(prefix,userPermissions)
        try {

            if (ctx.request.body.csrfToken !== ctx.cookies.get("csrfToken")) {
                throw new ExceptionCsrfTokenFailed(ExceptionCsrfTokenFailed.ExceptionCsrfTokenFailed);
            }

            let tag = (JSON.parse(ctx.request.body.json) as TagDataObject)

            let dbResultOk=false
            if (tag.uuid !== "") {
                dbResultOk = await tagService.updateOne(tag) 
            } else {
                dbResultOk = await tagService.create(tag)
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
                logger.error("DATABASE ERROR writing tag "+tag.uuid)                        
            }

        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.tag')
                
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
                logger.warn("SECURITY WARNING: Csrf Control Failed for user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.tag')
                
            }             
            else {
                logger.error(error)

            }             
        } finally{
            tagService.dispose()
        }

    })

    router.delete('/tag',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = TagServiceFactory.create(prefix,userPermissions)
        try {

            if (ctx.request.query.csrfToken !== ctx.cookies.get("csrfToken")) {
                throw new ExceptionCsrfTokenFailed(ExceptionCsrfTokenFailed.ExceptionCsrfTokenFailed);
            }

            let uuid:any = ctx.request.query.uuid || ""

            if (uuid !=="") {
                let dbResultOk=false
                dbResultOk = await tagService.deleteByUuId(uuid)    
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
                    logger.error("DATABASE ERROR deleting tag "+uuid)                    
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
                logger.warn("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.tag')
                
            }
            else if (error instanceof ExceptionCsrfTokenFailed) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                logger.warn("SECURITY WARNING: Csrf Control Failed for user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.tag')
                
            }              
            else {
                logger.error(error)

            }             
        } finally {
            tagService.dispose()            
        }
    })

    return router
}