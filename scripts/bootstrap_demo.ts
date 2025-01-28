import { BucketDataObject,BucketContextDataObject } from "../dataObjects/BucketDataObject";
import { FlagDataObject,FlagContextDataObject } from "../dataObjects/FlagDataObject";

import { BucketService } from "../services/BucketService"
import { FlagService } from "../services/FlagService"

import { Uuid } from "../../../services/utilities";

async function main() {

    let bucketService = new BucketService()
    let flagService = new FlagService()

    let bucketContext_dev = new BucketContextDataObject()
    bucketContext_dev.name = "Dev"
    bucketContext_dev.uuid = Uuid.createMongoUuId()
    let bucketContext_qa = new BucketContextDataObject()
    bucketContext_qa.name="QA"
    bucketContext_qa.uuid = Uuid.createMongoUuId()
    let bucketContext_prod = new BucketContextDataObject()
    bucketContext_prod.name="Production"
    bucketContext_prod.uuid = Uuid.createMongoUuId()

    let bucket = new BucketDataObject()
    bucket.name = "Demo Web APP"
    bucket.contexts.push(bucketContext_dev)
    bucket.contexts.push(bucketContext_qa)
    bucket.contexts.push(bucketContext_prod)

    await bucketService.create(bucket)

    let buckets = await bucketService.getAll()
    bucket = buckets[0]

    let flagContext = new FlagContextDataObject()
    flagContext.engine = "boolean"
    flagContext.bucket_context_uuid = bucket.contexts[2].uuid
    flagContext.engine_parameters = {
        "boolean": {
          "status": false
        },
        "boolean_conditioned_true": {
          "conditions": []
        },
        "boolean_conditioned_false": {
          "conditions": []
        },
        "boolean_conditionedor_true": {
          "conditions": []
        },
        "boolean_conditionedor_false": {
          "conditions": []
        },
        "string": {
          "value": ""
        }
      }

    let flag = new FlagDataObject()
    flag.bucket_uuid = bucket.uuid
    flag.name = "images.show-avatar-field"
    flag.contexts.push(flagContext)
    await flagService.create(flag)

    console.log(bucket.contexts[2].uuid)   

    process.exit()

}

main()
