import Controller from '../interfaces/controller.interface';
import { Request, Response, Router } from 'express';
import DataService from '../modules/services/data.service';
import { IData } from '../modules/models/data.model';

class DataController implements Controller {
   public path = '/api/data';
   public router = Router();
   private dataService = new DataService();

   constructor() {
       this.initializeRoutes();
   }

   private initializeRoutes() {
    this.router.get(`${this.path}/get`, this.getAll);
    this.router.post(`${this.path}/add`, this.addData);
    this.router.delete(`${this.path}/delete/:id`, this.deleteData);
}

   private async getAll(req: Request, res: Response): Promise<void> {
       try {
           const data: IData[] = await this.dataService.getAll();
           res.status(200).json(data);
       } catch (error) {
           res.status(500).json({ message: 'Error fetching data', error });
       }
   }

   private async addData(req: Request, res: Response): Promise<void> {
    try {
        const newData: IData = req.body; 
        const createdData = await this.dataService.add(newData);
        res.status(201).json(createdData);
    } catch (error) {
        res.status(500).json({ message: 'Error adding data', error: error.message });
    }
}

private async deleteData(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        await this.dataService.delete(id);
        res.status(200).json({ message: `Deleted entry with id: ${id}` });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting data', error: error.message });
    }
}

}

export default DataController;
