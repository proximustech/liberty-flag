import { Context } from "koa";
import Router from "koa-router"
import { TagService } from "../services/TagService";
import { TagDataObject,TagDataObjectValidator,TagDataObjectSpecs } from "../dataObjects/TagDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { ExceptionNotAuthorized,ExceptionRecordAlreadyExists,ExceptionInvalidObject } from "../../../types/exception_custom_errors";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    router.get('/tags', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = new TagService(prefix,viewVars.userPermissions)
        try {

            viewVars.tags = await tagService.getAll()

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.module_data.tags_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement         

            return ctx.render('plugins/_'+prefix+'/views/tags', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.tag')
                
            }
            else {
                console.error(error)
            }
        } finally {
            tagService.dispose()

        }
    })
    
    router.get('/tag_form', async (ctx:Context) => {
        viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = new TagService(prefix,viewVars.userPermissions)
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
            viewVars.tagValidateFunction = "app.module_data.tag_form.tagValidateFunction=" + TagDataObjectValidator.validateFunction

            viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
            viewVars.userHasPermissionOnElement = "app.module_data.tag_form.userHasPermissionOnElement=" +  UserHasPermissionOnElement            

            return ctx.render('plugins/_'+prefix+'/views/tag_form', viewVars);
        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to READ on " + prefix +'.tag')
                
            }
            else {
                console.error(error)
            }
        } finally {
            tagService.dispose()

        }
    })

    router.post('/tag',koaBody(), async (ctx:Context) => {
        
        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = new TagService(prefix,userPermissions)
        try {
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
                console.log("DATABASE ERROR writing tag "+tag.uuid)                        
            }

        } catch (error) {
            if (error instanceof ExceptionNotAuthorized) {
                ctx.status=401
                ctx.body = {
                    status: 'error',
                    messages: [{message:"Operation NOT Allowed"}]
                }         
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.tag')
                
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
        } finally{
            tagService.dispose()
        }

    })

    router.delete('/tag',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        const tagService = new TagService(prefix,userPermissions)
        try {
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
                    console.log("DATABASE ERROR deleting tag "+uuid)                    
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
                console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.tag')
                
            }
            else {
                console.error(error)

            }             
        } finally {
            tagService.dispose()            
        }
    })

    return router
}