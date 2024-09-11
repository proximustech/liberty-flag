import Router from "koa-router"
import { TagService } from "../services/TagService";
import { TagDataObject,TagDataObjectValidator,TagDataObjectSpecs } from "../dataObjects/TagDataObject";

import koaBody from 'koa-body';

module.exports = function(router:Router,viewVars:any,prefix:string){


    router.get('/tags', async (ctx) => {
        try {
            const tagService = new TagService()
            viewVars.tags = await tagService.getAll()
            return ctx.render('plugins/_'+prefix+'/views/tags', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    router.get('/tag_form', async (ctx) => {
        try {

            let uuid:any = ctx.request.query.uuid || ""
            let tag:TagDataObject = new TagDataObject()

            if (uuid !=="") {
                const tagService = new TagService()
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

            return ctx.render('plugins/_'+prefix+'/views/tag_form', viewVars);
        } catch (error) {
            console.error(error)
        }
    })

    router.post('/tag',koaBody(), async (ctx) => {
        const tagService = new TagService()
        let tag = (JSON.parse(ctx.request.body.json) as TagDataObject)

        let tagValidationResult=TagDataObjectValidator.validateFunction(tag,TagDataObjectValidator.validateSchema)
        if (tagValidationResult.isValid) {
            if (tag.uuid !== "") {
                tagService.updateOne(tag) 
            } else {
                tagService.create(tag)
            }
            ctx.body = {
                status: 'success',
            }
            
        } else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                messages: tagValidationResult.messages
            }
            
        }

    })

    router.delete('/tag',koaBody(), async (ctx) => {
        const tagService = new TagService()

        let uuid:any = ctx.request.query.uuid || ""

        if (uuid !=="") {
            await tagService.deleteByUuId(uuid)    
            ctx.body = {
                status: 'success',
            }
        }
        else {
            ctx.status=400
            ctx.body = {
                status: 'error',
                messate: "Invalid Uuid"
            }

        }

    })


    return router
}