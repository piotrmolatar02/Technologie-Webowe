import Controller from '../interfaces/controller.interface';
import { Request, Response, Router } from 'express';
import path from 'path';
import { Server } from 'socket.io';

class IndexController implements Controller {
    public path = '/*';
    public router = Router();
    private io?: Server;

    constructor(io?: Server) {
        this.io = io;
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(this.path, this.serveIndex);
        this.router.get(this.path + 'emit', this.emitReading);
    }

    private serveIndex = async (request: Request, response: Response) => {
        response.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    };

    private emitReading = async (request: Request, response: Response) => {
        try {
            this.io?.emit("message", "nowy pomiar z indexu");
            response.status(200).json({ res: "ok" });
        } catch (error) {
            console.error("Błąd podczas emisji danych:", error);
            response.status(500).json({ error: "Błąd serwera" });
        }
    };
}

export default IndexController;
