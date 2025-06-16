import DataModel from '../schemas/data.schema';
import {IData, Query} from "../models/data.model";

export default class DataService {

public async createData(dataParams: IData) {
   try {
       const dataModel = new DataModel(dataParams);
       await dataModel.save();
   } catch (error) {
       console.error('Wystąpił błąd podczas tworzenia danych:', error);
       throw new Error('Wystąpił błąd podczas tworzenia danych');
   }
}

public async query(deviceID: string) {
   try {
       const data = await DataModel.find({deviceId: deviceID}, { __v: 0, _id: 0 });
       return data;
   } catch (error) {
       throw new Error(`Query failed: ${error}`);
   }
}

public async get(deviceId: number) {
    try {
      const result = await DataModel.find(
        { deviceId },
        { __v: 0, _id: 0 }
      ).limit(1).sort({ $natural: -1 });
      return result.length ? result[0] : null;
    } catch (error) {
      throw new Error(`Błąd podczas pobierania danych: ${error.message}`);
    }
  }

  public async getAllNewest(totalDevices: number = 17) {
    const latestData: any[] = [];
    await Promise.all(
      Array.from({ length: totalDevices }, async (_, i) => {
        try {
          const latestEntry = await DataModel.find(
            { deviceId: i },
            { __v: 0, _id: 0 }
          ).limit(1).sort({ $natural: -1 });
          if (latestEntry.length) {
            latestData.push({
                id: i,
                data: {
                  temperature: latestEntry[0].temperature,
                  pressure: latestEntry[0].pressure,
                  humidity: latestEntry[0].humidity
                }
            });
          } else {
            latestData.push({
              id: i,
              data: null
            });
          }
        } catch (error) {
          latestData.push({
            id: i,
            data: null
          });
        }
      })
    );
    return latestData;
}


  public async deleteData(deviceId: number) {
    try {
      const result = await DataModel.deleteMany({ deviceId });
      return result.deletedCount;
    } catch (error) {
      throw new Error(`Błąd podczas usuwania danych: ${error.message}`);
    }
  }

  public async deleteAllData(): Promise<void> {
  try {
    await DataModel.deleteMany({});
  } catch (error) {
    //console.error('Błąd podczas usuwania wszystkich danych:', error);
    throw new Error('Błąd podczas usuwania wszystkich danych');
  }
}

public async deleteReadingsInRange(deviceId: number, from: Date, to: Date) {
    return await DataModel.deleteMany({
        deviceId,
        readingDate: { $gte: from, $lte: to }
    });
}
public async getLastReadingForDevice(deviceId: number) {
    return await DataModel.findOne({ deviceId }).sort({ readingDate: -1 }).select('readingDate');
}

public async getAllFromDate(fromDate: Date) {
  return await DataModel.find(
    { readingDate: { $gte: fromDate } },
    { __v: 0, _id: 0 }
  ).sort({ readingDate: 1 });
}

}
