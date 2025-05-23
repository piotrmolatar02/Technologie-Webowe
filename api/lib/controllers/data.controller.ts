import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import DataService from '../modules/services/data.service';

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
   public path = '/api/data';
   public router = Router();
   private dataService: DataService;

   constructor() {
    this.dataService = new DataService();
    this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getReadingById);
        this.router.get(`${this.path}/:id/latest`, checkIdParam, this.getLatestById);
        this.router.get(`${this.path}/:id/:num`, checkIdParam, this.getReadingsInRange);
        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
        this.router.delete(`${this.path}/all`, this.deleteAllData);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.deleteDataById);
        this.router.post(`${this.path}/bulk/:id`, checkIdParam, this.addDataBulk);
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

}
export default DataController;