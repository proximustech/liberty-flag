import {IDynamicView} from "../../../interfaces/dynamic_view_interface"
import { UserHasPermissionOnElement } from "../../users_control/services/UserPermissionsService";
import { DynamicViews } from "../../../services/dynamic_views_service";
import { dynamicViewsDefinition } from "../values/dynamic_views"

export default class ModuleMenu implements IDynamicView {
    async getPluginData(ctx:any,viewVars:any){
        viewVars.UserHasPermissionOnElement = UserHasPermissionOnElement
        viewVars.pluginsMenus=""
        await DynamicViews.addViewVarContent(dynamicViewsDefinition,"root","pluginsMenus",viewVars,ctx)
        return await ctx.render('plugins/_liberty_flag/views/module_menu', viewVars);
    }
}

