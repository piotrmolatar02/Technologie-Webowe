import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import DataService from '../modules/services/data.service';
import Joi from 'joi';
import { auth } from '../middlewares/auth.middleware';
import { admin } from '../middlewares/admin.middleware';


let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
   public path = '/api/data';
   public router = Router();

   constructor(private dataService: DataService) {
    this.initializeRoutes();
   }

   private initializeRoutes() {
    this.router.get(`${this.path}/hour`, auth, this.getLastHourAllDevices);
        this.router.get(`${this.path}/latest`, auth, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, checkIdParam, auth, this.getReadingById);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, auth, this.getLatestById);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, auth, this.getReadingsInRange);
        //  this.router.post(`${this.path}/:id`, checkIdParam, auth, this.addData);
        //this.router.delete(`${this.path}/all`, checkIdParam, auth, this.deleteAllData);
        //this.router.delete(`${this.path}/:id`, checkIdParam, auth, this.deleteDataById);
        this.router.post(`${this.path}/bulk/:id`, checkIdParam, auth, this.addDataBulk);
        this.router.delete(`${this.path}/:id/range`, checkIdParam, auth, this.deleteReadingsInRange);
        
        this.router.post(`${this.path}/admin-add`, auth, admin, this.adminAddData);
   }

    private getLatestReadingsFromAllDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const latestData = await this.dataService.getAllNewest(17);
      res.status(200).json(latestData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

    private getReadingById = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;

    try {
        const data = await this.dataService.query(id);
        response.status(200).json(data);
    } catch (error: any) {
        response.status(500).json({ error: error.message });
    }
};

    private getLatestById = async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = Number(req.params.id);
    try {
      const data = await this.dataService.get(deviceId);
      if (!data) {
        return res.status(404).json({ message: 'Brak danych dla urządzenia' });
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

    private getReadingsInRange = async (request: Request, response: Response, next: NextFunction) => {
        const { id, num } = request.params;
        const index = parseInt(id, 10);
        const count = parseInt(num, 10);

        if (isNaN(index) || index < 0 || index >= testArr.length || isNaN(count) || count <= 0) {
            return response.status(400).json({ message: 'Nieprawidłowy indeks lub liczba' });
        }
        const range = testArr.slice(index, index + count);
        response.status(200).json(range);
    }

    private addData = async (request: Request, response: Response, next: NextFunction) => {
    const { air } = request.body;
    const { id } = request.params;

    const schema = Joi.object({
   air: Joi.array()
       .items(
           Joi.object({
               id: Joi.number().integer().positive().required(),
               value: Joi.number().positive().required()
           })
       )
       .unique((a, b) => a.id === b.id),
   deviceId: Joi.number().integer().positive().valid(parseInt(id, 10)).required()
});

    if (!Array.isArray(air) || air.length < 3) {
        return response.status(400).json({ message: 'Dane muszą zawierać temperaturę, ciśnienie i wilgotność' });
    }

    const numericDeviceId = parseInt(id, 10);
    if (isNaN(numericDeviceId)) {
        return response.status(400).json({ message: 'Nieprawidłowy ID urządzenia (musi być liczbą)' });
    }

    const data = {
        temperature: air[0].value,
        pressure: air[1].value,
        humidity: air[2].value,
        deviceId: numericDeviceId,
        readingDate: new Date()
    };

    try {
        await this.dataService.createData(data);
        response.status(200).json(data);
    } catch (error: any) {
        console.error(`Validation Error: ${error.message}`);
        response.status(400).json({ error: 'Invalid input data.' });
    }
};


private deleteDataById = async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = Number(req.params.id);
    try {
      const deletedCount = await this.dataService.deleteData(deviceId);
      if (deletedCount === 0) {
        return res.status(404).json({ message: 'Nie znaleziono danych do usunięcia' });
      }
      res.status(200).json({ message: `Usunięto ${deletedCount} wpisów dla urządzenia ${deviceId}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
};

private deleteAllData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await this.dataService.deleteAllData(); 
    res.status(200).json({ message: 'Usunięto wszystkie dane' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

private addDataBulk = async (req: Request, res: Response, next: NextFunction) => {
  const { data } = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: 'Brak danych do dodania' });
  }

  const deviceId = Number(req.params.id);

  try {
    const promises = data.map(entry => {
      const dataToSave = {
        temperature: entry.temperature,
        pressure: entry.pressure,
        humidity: entry.humidity,
        deviceId: deviceId,
        readingDate: new Date()
      };
      return this.dataService.createData(dataToSave);
    });

    await Promise.all(promises);
    res.status(200).json({ message: `Dodano ${data.length} rekordów` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}


// DELETE /api/data/:id/range
private deleteReadingsInRange = async (req: Request, res: Response, next: NextFunction) => {
    const deviceId = Number(req.params.id);
    const { from, to } = req.body;

    if (!from || !to) {
        return res.status(400).json({ message: 'Brak zakresu czasu.' });
    }

    const fromDate = new Date(from);
    let toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return res.status(400).json({ message: 'Niepoprawny format daty.' });
    }

    try {
        const lastEntry = await this.dataService.getLastReadingForDevice(deviceId);

        if (lastEntry && lastEntry.readingDate && toDate > lastEntry.readingDate) {
            toDate = new Date(lastEntry.readingDate);
        }

        const result = await this.dataService.deleteReadingsInRange(deviceId, fromDate, toDate);

        res.status(200).json({ deletedCount: result.deletedCount });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

private getLastHourAllDevices = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const data = await this.dataService.getAllFromDate(hourAgo);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

private adminAddData = async (req: Request, res: Response) => {
    console.log("admin-add body:", req.body);

    const { temperature, pressure, humidity, deviceId, readingDate } = req.body;
    if (
        typeof temperature !== 'number' ||
        typeof pressure !== 'number' ||
        typeof humidity !== 'number' ||
        typeof deviceId !== 'number' ||
        isNaN(deviceId) || deviceId < 0
    ) {
        return res.status(400).json({ message: 'Brak lub niepoprawne dane wejściowe.' });
    }

    try {
        await this.dataService.createData({
            temperature,
            pressure,
            humidity,
            deviceId,
            readingDate: new Date(readingDate)
        });
        res.status(201).json({ message: "Dodano dane." });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};



}
export default DataController;