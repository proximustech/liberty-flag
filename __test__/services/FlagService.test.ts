import { BucketServiceFactory } from "../../factories/BucketServiceFactory";
import { BucketDataObject } from "../../dataObjects/BucketDataObject";
import { FlagServiceFactory } from "../../factories/FlagServiceFactory";
import { FlagDataObject } from "../../dataObjects/FlagDataObject";

const prefix = "liberty_flag"

let userPermissions:any = [
    ['',prefix+'.bucket','read'],['',prefix+'.bucket','write'],
    ['',prefix+'.flag','read'],['',prefix+'.flag','write'],
]
const flagService = FlagServiceFactory.create(prefix,userPermissions)
var createdFlagUuid = ""

const bucketService = BucketServiceFactory.create(prefix,userPermissions)
var createdBucketUuid = ""

describe("plugin: "+prefix+" - FlagService", () => {

    test('Create', async () => {
        let bucket = new BucketDataObject()
        bucket.name="utest-bucket-for-flag"
        createdBucketUuid = await bucketService.create(bucket)

        let flag = new FlagDataObject()
        flag.name="utest-flag"
        flag.bucket_uuid = createdBucketUuid
        createdFlagUuid = await flagService.create(flag)
        expect(createdFlagUuid.length).toBe(24);
    });
    test('Update', async () => {
        let flag = (await flagService.getByUuId(createdFlagUuid) as FlagDataObject)
        flag.name="utest-flag-updated"

        let updatedOk = await flagService.updateOne(flag)
        expect(updatedOk).toBe(true);
    });
    test('Delete', async () => {
        let deletedOk = await flagService.deleteByUuId(createdFlagUuid)
        let bucketDeletedOk = await bucketService.deleteByUuId(createdBucketUuid)        
        expect(deletedOk).toBe(true);
    });        

})