export class Config {

    public static LIBERTY_FLAG_PLUGIN_MONGO_URI:string = (process.env.LIBERTY_FLAG_PLUGIN_MONGO_URI as string)
    public static LIBERTY_FLAG_READ_ACCESS_TOKEN:string = (process.env.LIBERTY_FLAG_READ_ACCESS_TOKEN as string)
    public static LIBERTY_FLAG_WRITE_ACCESS_TOKEN:string = (process.env.LIBERTY_FLAG_WRITE_ACCESS_TOKEN as string)
    
}