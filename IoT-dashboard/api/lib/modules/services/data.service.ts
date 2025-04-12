import DataModel from '../schemas/data.schema';
import { IData } from '../models/data.model';


export default class DataService {


   public async getAll() {
       try {
           const data = await DataModel.find();
           return data;
       } catch (error) {
           throw new Error(`Query failed: ${error}`);
       }
   }

   public async add(data: IData) {
    try {
        const newData = new DataModel(data);
        return await newData.save();
    } catch (error) {
        throw new Error(`Insert failed: ${error}`);
    }
}

public async delete(id: string) {
    try {
        return await DataModel.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Delete failed: ${error}`);
    }
}

}
