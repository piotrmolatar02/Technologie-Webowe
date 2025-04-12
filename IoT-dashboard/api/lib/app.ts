import express from 'express';
import { config } from './config';
import Controller from "./interfaces/controller.interface";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

class App {
    public app: express.Application;
    private server: http.Server;
    public io: Server;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.server = http.createServer(this.app);

        this.initializeMiddlewares();
        this.initializeSocket();
        this.initializeControllers(controllers);
        this.connectToDatabase();
    }

    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }

    public listen(): void {
        this.server.listen(config.socketPort, () => {
            console.log(`Server  listening on port ${config.socketPort}`);
        });
    }

    private initializeMiddlewares(): void {
        this.app.use(cors({
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            allowedHeaders: ["Authorization"],
            credentials: true
        }));
        this.app.use(bodyParser.json());
    }

    private initializeSocket(): void {
        this.io = new Server(this.server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                allowedHeaders: ["Authorization"],
                credentials: true
            }
        });

        this.io.on("connection", (socket: Socket) => {
            console.log(`Nowe połączenie: ${socket.id}`);

            socket.on("message", (data: string) => {
                console.log(`Wiadomość od ${socket.id}: ${data}`);
                this.io.emit("message", data); 
            });

            socket.on("disconnect", () => {
                console.log(`Rozłączono: ${socket.id}`);
            });
        });
    }

    private async connectToDatabase(): Promise<void> {
        mongoose.set('debug', true);
        try {
            await mongoose.connect(config.databaseUrl);
            console.log('Connection with database established');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }

    public getIo(): Server {
        return this.io;
    }
}

export default App;
