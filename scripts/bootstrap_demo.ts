import { BucketDataObject,BucketContextDataObject } from "../dataObjects/BucketDataObject";
import { FlagDataObject,FlagContextDataObject } from "../dataObjects/FlagDataObject";

import { BucketService } from "../services/BucketService"
import { FlagService } from "../services/FlagService"

import { Uuid } from "../../../services/utilities";


function getRandomString(){
  return (Math.random()+1).toString(36).substring(2)
}

async function createFlag(flagService:FlagService,bucket:BucketDataObject,flagName:string) {

  let flagContext = new FlagContextDataObject()
  flagContext.engine = "boolean"
  flagContext.engine_parameters = {
    "boolean": {
      "status": true
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
      "value": "",
      "configuration": ""
    }
  }
  
  let flag = new FlagDataObject()
  flag.bucket_uuid = bucket.uuid
  flag.name = flagName

  flagContext.bucket_context_uuid = bucket.contexts[0].uuid
  flag.contexts.push(flagContext)
  let secondFlagContext = {...flagContext}
  secondFlagContext.bucket_context_uuid = bucket.contexts[1].uuid
  flag.contexts.push(secondFlagContext)
  let thirdFlagContext = {...flagContext}
  thirdFlagContext.bucket_context_uuid = bucket.contexts[2].uuid
  flag.contexts.push(thirdFlagContext)
  await flagService.create(flag)

}
async function createBucketWithFlags(bucketService:BucketService,flagService:FlagService,bucketName:string,flagNames:[]) {

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
  bucket.name = bucketName
  bucket.contexts.push(bucketContext_dev)
  bucket.contexts.push(bucketContext_qa)
  bucket.contexts.push(bucketContext_prod)

  await bucketService.create(bucket)
  let buckets = await bucketService.getAll()
  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
    const savedBucket = buckets[bucketIndex];
    if (savedBucket.name === bucket.name) {
      bucket.uuid = savedBucket.uuid
      break
    }
    
  }

  for (let flagNameIndex = 0; flagNameIndex < flagNames.length; flagNameIndex++) {
    const flagName = flagNames[flagNameIndex];
    await createFlag(flagService,bucket,flagName)
  }

}

async function randomDbPopulation(bucketService:BucketService,flagService:FlagService) {

  let bucketsNumber = 10
  let flagNamesNumber=10

  for (let bucketIndex = 0; bucketIndex < bucketsNumber; bucketIndex++) {
    let flagNames:any=[]
    for (let flagNameIndex = 0; flagNameIndex < flagNamesNumber; flagNameIndex++) {
      flagNames.push(getRandomString())
    }
    let bucketName:string = getRandomString()
    try {
      await createBucketWithFlags(bucketService,flagService,bucketName,flagNames)
    } catch (error) {}
  }

}

async function main() {

  let userPermissions:any = [['','liberty_flag.flag','read'],['','liberty_flag.flag','write']]
  const flagService = new FlagService('liberty_flag',userPermissions)
  const bucketService = new BucketService()

  // Especial elements DB population

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
  bucket = buckets[buckets.length -1]

  let flagContext = new FlagContextDataObject()
  flagContext.engine = "boolean"
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
      "value": "",
      "configuration": ""
    }
  }

  let flag = new FlagDataObject()
  flag.bucket_uuid = bucket.uuid
  flag.name = "images.show-avatar-field"

  flagContext.bucket_context_uuid = bucket.contexts[0].uuid
  flag.contexts.push(flagContext)
  let secondFlagContext = {...flagContext}
  secondFlagContext.bucket_context_uuid = bucket.contexts[1].uuid
  flag.contexts.push(secondFlagContext)
  let thirdFlagContext = {...flagContext}
  thirdFlagContext.bucket_context_uuid = bucket.contexts[2].uuid
  flag.contexts.push(thirdFlagContext)

  await flagService.create(flag)

  flagContext = new FlagContextDataObject()
  flagContext.engine = "string"
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
      "value": "Light",
      "configuration": "Light,Dark,Wall"
    }
  }

  flag = new FlagDataObject()
  flag.bucket_uuid = bucket.uuid
  flag.name = "app.theme"

  flagContext.bucket_context_uuid = bucket.contexts[0].uuid
  flag.contexts.push(flagContext)
  secondFlagContext = {...flagContext}
  secondFlagContext.bucket_context_uuid = bucket.contexts[1].uuid
  flag.contexts.push(secondFlagContext)
  thirdFlagContext = {...flagContext}
  thirdFlagContext.bucket_context_uuid = bucket.contexts[2].uuid
  flag.contexts.push(thirdFlagContext)

  await flagService.create(flag)
  
  console.log(bucket.contexts[2].uuid)     

  await randomDbPopulation(bucketService,flagService)

  flagService.dispose()
  bucketService.dispose()

  process.exit()

}

main()
