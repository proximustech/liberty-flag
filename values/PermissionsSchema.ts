import { permissions as p } from "../../users_control/values/permissions";
export let LibertyFlag_permissionsSchema = {
    /*
    "plugin_name": {
        "label": "---",
        "schema": [
            {
                "resource":"one",
                "permissions":[p.read,p.write]
            },
            {
                "resource":"two",
                "permissions":[p.read,p.write]
            },
        ]
    }    
    */
    "liberty_flag": {
        "label": "Liberty Flag",
        "schema": [
            {
                "resource":"bucket",
                "permissions":[p.read,p.write]
            },
            {
                "resource":"flag",
                "permissions":[p.read,p.write]
            },
        ]
    }
}