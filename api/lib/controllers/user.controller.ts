import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { auth } from '../middlewares/auth.middleware';
import { admin } from '../middlewares/admin.middleware';
import UserService from '../modules/services/user.service';
import PasswordService from '../modules/services/password.service';
import TokenService from '../modules/services/token.service';

class UserController implements Controller {
    public path = '/api/user';
    public router = Router();

    constructor(private userService: UserService, private passwordService: PasswordService, private tokenService: TokenService) {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.patch("/test", (req, res) => {
  console.log("Działa PATCH test");
  res.send({ ok: true });
});
        this.router.post(`${this.path}/create`, this.createNewOrUpdate);
        this.router.post(`${this.path}/auth`, this.authenticate);
        //this.router.post(`${this.path}/login`, this.authenticate);
        this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
        this.router.post(`${this.path}/reset-password`, this.resetPassword);
        this.router.get(`${this.path}/all-users`, auth, admin, this.getAllUsers); // admin only
        this.router.patch(`${this.path}/:userId/role`, auth, admin, this.changeUserRole); // admin only
        this.router.delete(`${this.path}/delete/:userId`, auth, admin, this.deleteUserById); // admin only
    }

    private authenticate = async (request: Request, response: Response, next: NextFunction) => {
        const { login, password } = request.body;
        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(401).json({ error: 'Unauthorized' });
            }

            const isAuthorized = await this.passwordService.authorize(user._id, password);
            if (!isAuthorized) {
                return response.status(401).json({ error: 'Unauthorized' });
            }

            const token = await this.tokenService.create(user);
            response.status(200).json(this.tokenService.getToken(token));
        } catch (error: any) {
            response.status(401).json({ error: 'Unauthorized' });
        }
    };

    private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
        const userData = request.body;
        if (!userData.role) userData.role = 'user';
        if (userData.isAdmin === undefined) userData.isAdmin = false;
        try {
            const user = await this.userService.createNewOrUpdate(userData);
            if (userData.password) {
                const hashedPassword = await this.passwordService.hashPassword(userData.password)
                await this.passwordService.createOrUpdate({
                    userId: user._id,
                    password: hashedPassword
                });
            }
            response.status(200).json(user);
        } catch (error: any) {
            response.status(400).json({ error: 'Bad request', value: error.message });
        }
    };

    private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
        const { userId } = request.params;
        try {
            const result = await this.tokenService.remove(userId);
            response.status(200).json(result);
        } catch (error: any) {
            response.status(401).json({ error: 'Unauthorized' });
        }
    };

    private resetPassword = async (request: Request, response: Response, next: NextFunction) => {
        const { login } = request.body;
        try {
            const user = await this.userService.getByEmailOrName(login);
            if (!user) {
                return response.status(404).json({ error: 'User not found' });
            }
            const newPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await this.passwordService.hashPassword(newPassword);
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });
            response.status(200).json({
                message: 'Password reset successfully. Check your email.',
                newPassword
            });
        } catch (error: any) {
            response.status(500).json({ error: 'Internal server error' });
        }
    };

    private getAllUsers = async (req: Request, res: Response) => {
    console.log('--- getAllUsers wywołane ---');
    const users = await this.userService.getAll();
    console.log('Znalezieni użytkownicy:', users);
    res.status(200).json(users);
};

    // PATCH /api/user/:userId/role
    private changeUserRole = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role, isAdmin } = req.body;
    try {
        const updatedUser = await this.userService.changeUserRole(userId, role, isAdmin);
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json(updatedUser);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};


    // DELETE /api/user/:userId
    private deleteUserById = async (req: Request, res: Response) => {
        const { userId } = req.params;
        try {
            const deleted = await this.userService.deleteById(userId);
            if (!deleted) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

export default UserController;
