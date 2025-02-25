import { IDataPulseManager } from "../interfaces/data_pulse_manager_interface";

export class DataPulseManagerInternal implements IDataPulseManager {
    public static dataPulseDataMap = new Map<string,any[]>()

    save(key: string, value: any): boolean {
        let response=true
        try {
            if (DataPulseManagerInternal.dataPulseDataMap.has(key)) {
                let oldValueDict:any = DataPulseManagerInternal.dataPulseDataMap.get(key)
                oldValueDict.push(value)
        
                if (oldValueDict.length > 100) {
                  oldValueDict.shift()         
                }
            }
            else {
                DataPulseManagerInternal.dataPulseDataMap.set(key,[value])
            }
        } catch (error) {
            
        }
        return response

    }   
    getFromDateRange(key: string, fromDate: Date, toDate: Date) {
        if (DataPulseManagerInternal.dataPulseDataMap.has(key)) {
            return DataPulseManagerInternal.dataPulseDataMap.get(key)
            
        }
        else {
            return []
        }        
        
    }
    getFromDateRangeAndFilter(key: string, fromDate: Date, toDate: Date, filter: any) {
        throw new Error("Method not implemented.");
    }
    getFromFilter(key: string, filter: any) {
        throw new Error("Method not implemented.");
    }

}