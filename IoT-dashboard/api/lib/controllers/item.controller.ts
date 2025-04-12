import { Router, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface';
import { Server } from 'socket.io';

class ItemController implements Controller {
    public path = '/api/items';
    public router = Router();
    private items: { id: number; name: string }[] = [];
    private nextId = 1;
    private io?: Server;

    constructor(io?: Server) {
        this.io = io;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(this.path, this.createItem);
        this.router.get(this.path, this.getAllItems);
        this.router.get(`${this.path}/:id`, this.getItemById);
        this.router.put(`${this.path}/:id`, this.updateItem);
        this.router.delete(`${this.path}/:id`, this.deleteItem);
    }

    private createItem = (req: Request, res: Response) => {
        const newItem = { id: this.nextId++, name: req.body.name };
        this.items.push(newItem);
        // this.io?.emit("message", "nowy item utworzony"); // możesz dodać, jeśli chcesz
        res.status(201).json(newItem);
    };

    private getAllItems = (_req: Request, res: Response) => {
        res.json(this.items);
    };

    private getItemById = (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        const item = this.items.find(i => i.id === id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    };

    private updateItem = (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        const itemIndex = this.items.findIndex(i => i.id === id);
        if (itemIndex > -1) {
            this.items[itemIndex].name = req.body.name;
            res.json(this.items[itemIndex]);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    };

    private deleteItem = (req: Request, res: Response) => {
        const id = parseInt(req.params.id, 10);
        const itemIndex = this.items.findIndex(i => i.id === id);
        if (itemIndex > -1) {
            this.items.splice(itemIndex, 1);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    };
}

export default ItemController;
