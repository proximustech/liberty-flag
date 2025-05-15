import {IDynamicView} from "../../../interfaces/dynamic_view_interface"
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";

export default class ModuleMenu implements IDynamicView {
    async getPluginData(ctx:any,viewVars:any){
        viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
        return await ctx.render('plugins/_liberty_flag/views/module_menu', viewVars);
    }
}

