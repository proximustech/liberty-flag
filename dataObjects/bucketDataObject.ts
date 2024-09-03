export class BucketDataObject {
    _id:any = ""
    uuid:string = ""
    name:string = ""
    subBuckets:Array<BucketDataObject> = []
}

export const BucketDataObjectValidator:any = {

    validateData : {
        name : {
            regexp:".{5,30}",
            message:"Name must be in the range of 5 and 30 characters."
        },
    },

    validateFunction : (data:any,validateData:any) => {
        let fieldRegexp = ""
        let fieldValue = ""
        let result = []
        let regexpValidator = undefined

        for (const [fieldName, fieldData] of Object.entries(validateData)) {
            fieldRegexp = validateData[fieldName]["regexp"]
            fieldValue = data[fieldName]

            regexpValidator = new RegExp(fieldRegexp);
            if (!regexpValidator.test(fieldValue)) {
                result.push({
                    field:fieldName,
                    message:validateData[fieldName]["message"]
                })
            }
        }
        return result
    }
}