import { BucketDataObject,BucketContextDataObject } from "../dataObjects/BucketDataObject";
import { FlagDataObject,FlagContextDataObject } from "../dataObjects/FlagDataObject";

import { FlagService } from "../services/FlagService";
import { BucketService } from "../services/BucketService";
import { BucketServiceFactory } from "../factories/BucketServiceFactory"
import { FlagServiceFactory } from "../factories/FlagServiceFactory"

import { Uuid,Random } from "../../../services/utilities";
import { ExceptionNotAuthorized, ExceptionRecordAlreadyExists, ExceptionInvalidObject } from "../../../types/exceptions";

const faker=require("faker")

async function createFlag(flagService:FlagService,bucket:BucketDataObject,flagName:string,engine:string="boolean",engineParameters:any={
  "boolean": {
    "status": Math.random() < 0.5
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
  },
  "numeric":{
    "value":"",
    "min_value":"",
    "max_value":""
  }  
}) {

  let flagContext = new FlagContextDataObject()
  flagContext.engine = engine
  flagContext.engine_parameters = engineParameters
  
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
  try {
    await flagService.create(flag)
  } catch (error) {
    if (error instanceof ExceptionNotAuthorized) {         
      console.log("Operation NOT Allowed")
      
    }
    else if (error instanceof ExceptionRecordAlreadyExists) {
      console.log("Record Exists")
        
    }
    else if (error instanceof ExceptionInvalidObject) {
        console.log(error.errorMessages[0])
        
    }
    else {
        console.error(error)

    }       
  }

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

async function createBucket(bucketService:BucketService,bucketName:string):Promise<BucketDataObject> {

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

  try {
    await bucketService.create(bucket)
  } catch (error) {
    if (error instanceof ExceptionNotAuthorized) {         
      console.log("Operation NOT Allowed")
      
    }
    else if (error instanceof ExceptionRecordAlreadyExists) {
      console.log("Record Exists")
        
    }
    else if (error instanceof ExceptionInvalidObject) {
        console.log(error.errorMessages[0])
        
    }
    else {
        console.error(error)
    }     
  }

  let buckets = await bucketService.getAll()
  for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
    const savedBucket = buckets[bucketIndex];
    if (savedBucket.name === bucket.name) {
      bucket.uuid = savedBucket.uuid
      break
    }
    
  }
  return bucket

}

async function randomDbPopulation(bucketService:BucketService,flagService:FlagService) {

  let bucketsNumber = 5
  let flagNamesNumber=5

  for (let bucketIndex = 0; bucketIndex < bucketsNumber; bucketIndex++) {
    let flagNames:any=[]
    for (let flagNameIndex = 0; flagNameIndex < flagNamesNumber; flagNameIndex++) {
      flagNames.push(faker.hacker.noun()+'.'+ faker.hacker.adjective())
    }
    let bucketName:string = faker.name.jobDescriptor()
    try {
      await createBucketWithFlags(bucketService,flagService,bucketName,flagNames)
    } catch (error) {
      console.log(error)
    }
  }

}

async function main() {

  let userPermissions:any = [
    ['','liberty_flag.bucket','read'],['','liberty_flag.bucket','write'],
    ['','liberty_flag.flag','read'],['','liberty_flag.flag','write'],
  ]
  const flagService = FlagServiceFactory.create('liberty_flag',userPermissions)
  const bucketService = BucketServiceFactory.create('liberty_flag',userPermissions)

  // Especial elements DB population

  let bucket= await createBucket(bucketService,"Pipelines")
  await createFlag(flagService,bucket,"kubernetes.canary")
  await createFlag(flagService,bucket,"testing.load")

  bucket= await createBucket(bucketService,"Client.Services")
  await createFlag(flagService,bucket,"images.show-avatar-field")
  await createFlag(flagService,bucket,"app.theme","string",{
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
      "configuration": "Light|Dark|Wall"
    },
    "numeric":{
      "value":"",
      "min_value":"",
      "max_value":""
    }
  })
  await createFlag(flagService,bucket,"outbound.calling")
  await createFlag(flagService,bucket,"outbound.campaign","string",{
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
      "value": "bank",
      "configuration": "bank|health"
    },
    "numeric":{
      "value":"",
      "min_value":"",
      "max_value":""
    }
  })

  await createFlag(flagService,bucket,"app.dashes-number","numeric",{
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
      "value": "bank",
      "configuration": "bank|health"
    },
    "numeric":{
      "value":"10",
      "min_value":"0",
      "max_value":"15"
    }
  })

  //////////////////////////////////////
  
  
  await randomDbPopulation(bucketService,flagService)

  flagService.dispose()
  bucketService.dispose()
  
  console.log(bucket.contexts[2].uuid)     
  process.exit()

}

main()
