import {IDynamicView} from "../../../interfaces/dynamic_view_interface"

export class ModuleMenu implements IDynamicView {
    async getPluginData(ctx:any,viewVars:any){
        return await ctx.render('plugins/_liberty_flag/views/module_menu', viewVars);
    }
}

