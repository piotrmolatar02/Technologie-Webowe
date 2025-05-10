import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
   public path = '/api/data';
   public router = Router();

   constructor() {
       this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.get(`${this.path}/latest`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/:id`, this.getReadingById);
        this.router.get(`${this.path}/:id/latest`, this.getLatestById);
        this.router.get(`${this.path}/:id/:num`, this.getReadingsInRange);
        this.router.post(`${this.path}/:id`, this.addData);
        this.router.delete(`${this.path}/all`, this.deleteAllData);
        this.router.delete(`${this.path}/:id`, this.deleteDataById);
   }

    private getLatestReadingsFromAllDevices = async (request: Request, response: Response, next: NextFunction) => {
        response.status(200).json(testArr);
    }

    private getReadingById = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const index = parseInt(id, 10);
        if (isNaN(index) || index < 0 || index >= testArr.length) {
            return response.status(400).json({ message: 'Nieprawidłowy indeks' });
        }
        response.status(200).json(testArr[index]);
    }

    private getLatestById = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const index = parseInt(id, 10);
        if (isNaN(index) || index < 0 || index >= testArr.length) {
            return response.status(400).json({ message: 'Nieprawidłowy indeks' });
        }
        const latestValue = Math.max(...testArr);
        response.status(200).json(latestValue);
    }

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
    const { elem } = request.body;
    const { id } = request.params;

    let numericElem: number;

    if (typeof elem === 'string') {
        numericElem = parseFloat(elem);
        if (isNaN(numericElem)) {
            return response.status(400).json({ message: 'Wymagany typ: number lub string do konwersji na liczbę' });
        }
    } else if (typeof elem === 'number') {
        numericElem = elem;
    } else {
        return response.status(400).json({ message: 'Wymagany typ: number lub string' });
    }

    const index = parseInt(id, 10);
    if (isNaN(index)) {
        return response.status(400).json({ message: 'Nieprawidłowy indeks' });
    }

    if (index > testArr.length) {
        return response.status(400).json({ message: 'Nieprawidłowy indeks' });
    }
    testArr[index] = numericElem;

    response.status(200).json({ message: `Dodano element na pozycji o indeksie ${index}`, data: testArr });
}

private deleteAllData = async (request: Request, response: Response, next: NextFunction) => {
        testArr = [];
        response.status(200).json({ message: 'Usunięto wszystkie elementy' });
    }

    private deleteDataById = async (request: Request, response: Response, next: NextFunction) => {
        const { id } = request.params;
        const index = parseInt(id, 10);

        if (isNaN(index) || index < 0 || index >= testArr.length) {
            return response.status(400).json({ message: 'Nieprawidłowy indeks' });
        }

        testArr.splice(index, 1);
        response.status(200).json({ message: `Usunięto element na pozycji o indeksie ${index}`, data: testArr });
    }
}

export default DataController;