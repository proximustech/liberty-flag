import {IDynamicView} from "../../../interfaces/dynamic_view_interface"
import { LibertyFlag_permissionsSchema } from "../values/PermissionsSchema";

export default class Permissions implements IDynamicView {
    async getPluginData(ctx:any,viewVars:any){
        viewVars.libertyFlag_permissionsSchema = LibertyFlag_permissionsSchema
        return await ctx.render('plugins/_liberty_flag/views/permissions', viewVars);
    }
}

