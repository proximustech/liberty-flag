export interface IDataPulseManager { 
    save(key:string,value:any): boolean ;
    getFromDateRange(key:string,fromDate:Date,toDate:Date): any ;
    getFromDateRangeAndFilter(key:string,fromDate:Date,toDate:Date,filter:any): any;
    getFromFilter(key:string,filter:any): any ;
}