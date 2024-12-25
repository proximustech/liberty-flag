import Router from "koa-router"
import { Context } from "koa";
import { FlagService } from "../services/FlagService";
import { BucketService } from "../services/BucketService";
import { TagService } from "../services/TagService";
import { FlagDataObject,FlagDataObjectValidator,FlagDataObjectSpecs, FlagContextDataObject } from "../dataObjects/FlagDataObject";
import { EngineBooleanDataObject,EngineBooleanDataObjectSpecs,EngineBooleanDataObjectValidator } from "../dataObjects/EngineBooleanDataObject";
import { EngineBooleanConditionedDataObject,EngineBooleanConditionedConditionDataObject,EngineBooleanConditionedConditionDataObjectValidator } from "../dataObjects/EngineBooleanConditionedDataObject";
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";

import koaBody from 'koa-body';

module.exports = function(router:Router,appViewVars:any,prefix:string){

    let viewVars = {...appViewVars};
    viewVars.prefix = prefix

    router.get('/flags', async (ctx:Context) => {
        try {

            let bucketUuid:any = ctx.request.query.bucket_uuid || ""

            if (bucketUuid !=="") {

                const tagService = new TagService()
                viewVars.tagUuidMap = tagService.getUuidMapFromList(await tagService.getAll())

                const flagService = new FlagService()
                const bucketService = new BucketService()
                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                viewVars.flags = await flagService.getAllByBucketUuid(bucketUuid)

                viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
                viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
                viewVars.userHasPermissionOnElement = "app.module_data.flags_list.userHasPermissionOnElement=" +  UserHasPermissionOnElement         

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
            console.error(error)
        }
    })

    router.get('/flag_form', async (ctx:Context) => {
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let bucketUuid:any = ctx.request.query.bucket_uuid || ""
            if (bucketUuid !== "") {
                const bucketService = new BucketService()
                viewVars.bucket = await bucketService.getByUuId(bucketUuid)
                
                let flag:FlagDataObject = new FlagDataObject()
                const tagService = new TagService()
                viewVars.tags = await tagService.getAll()

                if (uuid !=="") {
    
                    const flagService = new FlagService()
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
                viewVars.flagValidateFunction = "app.module_data.flag_form.flagValidateFunction=" + FlagDataObjectValidator.validateFunction

                let flagContext = new FlagContextDataObject()
                viewVars.flagContext = flagContext

                viewVars.engineBoolean = new EngineBooleanDataObject(false)

                viewVars.engineBooleanMetadata = EngineBooleanDataObjectSpecs.metadata
                viewVars.engineBooleanFieldRender = EngineBooleanDataObjectSpecs.htmlDataObjectFieldRender
                viewVars.engineBooleanValidateSchema = EngineBooleanDataObjectValidator.validateSchema
                viewVars.engineBooleanValidateFunction = "app.module_data.flag_form.engineBooleanValidateFunction=" + EngineBooleanDataObjectValidator.validateFunction                
                                
                viewVars.engineBooleanConditioned = new EngineBooleanConditionedDataObject()
                viewVars.engineBooleanConditionedCondition = new EngineBooleanConditionedConditionDataObject()
                viewVars.engineBooleanConditionedConditionValidateShema = EngineBooleanConditionedConditionDataObjectValidator.validateSchema
                viewVars.engineBooleanConditionedConditionValidateFunction = "app.module_data.flag_form.engineBooleanConditionedConditionValidateFunction=" + EngineBooleanConditionedConditionDataObjectValidator.validateFunction                

                viewVars.userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
                viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
                viewVars.userHasPermissionOnElement = "app.module_data.flag_form.userHasPermissionOnElement=" +  UserHasPermissionOnElement                            

                return ctx.render('plugins/_'+prefix+'/views/flag_form', viewVars);
                
            } else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    messages: "Invalid bucket uuid"
                }
                
            }

        } catch (error) {
            console.error(error)
        }
    })

    router.post('/flag',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        let processAllowed = UserHasPermissionOnElement(userPermissions,[prefix+'.flag'],['write'])
        if (!processAllowed) {

            ctx.status=401
            ctx.body = {
                status: 'error',
                messages: [{message:"Operation NOT Allowed"}]
            }         
            console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.flag')

        }
        else {

            const flagService = new FlagService()
            let flag = (JSON.parse(ctx.request.body.json) as FlagDataObject)

            let flagValidationResult=FlagDataObjectValidator.validateFunction(flag,FlagDataObjectValidator.validateSchema)
            if (await flagService.fieldValueExists(flag.uuid,"name",flag.name)){
                ctx.status=409
                ctx.body = {
                    status: 'error',
                    messages: [{field:"name",message:"Name already exists"}]
                }              
            }
            else if (flagValidationResult.isValid) {
                if (flag.uuid !== "") {
                    flagService.updateOne(flag) 
                } else {
                    flagService.create(flag)
                }
                ctx.body = {
                    status: 'success',
                }
                
            } else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    messages: flagValidationResult.messages
                }
                
            }
        }

    })

    router.delete('/flag',koaBody(), async (ctx:Context) => {

        let userPermissions = await ctx.authorizer.getRoleAndSubjectPermissions(ctx.session.passport.user.role_uuid,ctx.session.passport.user.uuid)
        let processAllowed = UserHasPermissionOnElement(userPermissions,[prefix+'.flag'],['write'])
        if (!processAllowed) {

            ctx.status=401
            ctx.body = {
                status: 'error',
                messages: [{message:"Operation NOT Allowed"}]
            }         
            console.log("SECURITY WARNING: unauthorized user " + ctx.session.passport.user.uuid + " traying to WRITE on " + prefix +'.flag')

        }
        else {

            const flagService = new FlagService()
            let uuid:any = ctx.request.query.uuid || ""

            if (uuid !=="") {
                await flagService.deleteByUuId(uuid)    
                ctx.body = {
                    status: 'success',
                }
            }
            else {
                ctx.status=400
                ctx.body = {
                    status: 'error',
                    message: "Invalid Uuid"
                }

            }
        }

    })

    return router
}