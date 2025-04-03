import { TagServiceFactory } from "../../factories/TagServiceFactory";
import { TagDataObject } from "../../dataObjects/TagDataObject";

const prefix = "liberty_flag"

let userPermissions:any = [
    ['',prefix+'.bucket','read'],['',prefix+'.bucket','write'],
    ['',prefix+'.flag','read'],['',prefix+'.flag','write'],
    ['',prefix+'.tag','read'],['',prefix+'.tag','write'],
]
const tagService = TagServiceFactory.create(prefix,userPermissions)
var createdTagUuid = ""

describe("plugin: "+prefix+" - TagService", () => {

    test('Create', async () => {
        let tag = new TagDataObject()
        tag.name="utest-tag"
        createdTagUuid = await tagService.create(tag)
        expect(createdTagUuid.length).toBe(24);
    });
    test('Update', async () => {
        let tag = (await tagService.getByUuId(createdTagUuid) as TagDataObject)
        tag.name="utest-tag-updated"

        let updatedOk = await tagService.updateOne(tag)
        expect(updatedOk).toBe(true);
    });
    test('Delete', async () => {
        let deletedOk = await tagService.deleteByUuId(createdTagUuid)
        expect(deletedOk).toBe(true);
    });        

})