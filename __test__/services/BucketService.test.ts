import { BucketServiceFactory } from "../../factories/BucketServiceFactory";
import { BucketDataObject } from "../../dataObjects/BucketDataObject";

const prefix = "liberty_flag"

let userPermissions:any = [
    ['',prefix+'.bucket','read'],['',prefix+'.bucket','write'],
    ['',prefix+'.flag','read'],['',prefix+'.flag','write'],
]
const bucketService = BucketServiceFactory.create(prefix,userPermissions)
var createdBucketUuid = ""

describe("plugin: "+prefix+" - BucketService", () => {

    test('Create', async () => {
        let bucket = new BucketDataObject()
        bucket.name="utest-bucket"
        createdBucketUuid = await bucketService.create(bucket)
        expect(createdBucketUuid.length).toBe(24);
    });
    test('Update', async () => {
        let bucket = (await bucketService.getByUuId(createdBucketUuid) as BucketDataObject)
        bucket.name="utest-bucket-updated"

        let updatedOk = await bucketService.updateOne(bucket)
        expect(updatedOk).toBe(true);
    });
    test('Delete', async () => {
        let deletedOk = await bucketService.deleteByUuId(createdBucketUuid)
        expect(deletedOk).toBe(true);
    });        

})