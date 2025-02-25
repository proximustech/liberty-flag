import { IDataPulseManager } from "../interfaces/data_pulse_manager_interface";
import { DataPulseManagerInternal } from "../services/DataPulseManagerInternalService";

export class DataPulseManagerServiceFactory{

    public static create(): IDataPulseManager{

        return new DataPulseManagerInternal()

    }

}