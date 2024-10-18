let p = {
    read:"read",
    write:"write"
}
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
            {
                "resource":"tag",
                "permissions":[p.read,p.write]
            },
        ]
    }
}