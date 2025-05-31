import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from '../modules/services/user.service';
import PasswordService from '../modules/services/password.service';
import TokenService from '../modules/services/token.service';
import { permit } from '../middlewares/role.middleware';

class UserController implements Controller {
   public path = '/api/user';
   public router = Router();

   constructor(private userService: UserService, private passwordService: PasswordService, private tokenService: TokenService) {
       this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.post(`${this.path}/create`, this.createNewOrUpdate);
       this.router.post(`${this.path}/auth`, this.authenticate);
       this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
       this.router.post(`${this.path}/reset-password`, this.resetPassword);
       this.router.get(`${this.path}/all-users`, auth, permit('admin'), this.getAllUsers);
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
   } catch (error) {
       console.error(`Validation Error: ${error.message}`);
       response.status(401).json({ error: 'Unauthorized' });
   }
};


private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
   const userData = request.body;
   console.log('userData', userData)
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
   } catch (error) {
       console.error(`Validation Error: ${error.message}`);
       response.status(400).json({error: 'Bad request', value: error.message});
   }


};


private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
   const {userId} = request.params;


   try {
       const result = await this.tokenService.remove(userId);
       console.log('aaa', result)
       response.status(200).json(result);
   } catch (error) {
       console.error(`Validation Error: ${error.message}`);
       response.status(401).json({error: 'Unauthorized'});
   }
};

private resetPassword = async (request: Request, response: Response) => {
    const { login } = request.body;
    console.log(`Reset hasła dla loginu: ${login}`);

    try {
        const user = await this.userService.getByEmailOrName(login);
        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }

        const newPassword = Math.random().toString(36).slice(-10);

        const hashed = await this.passwordService.hashPassword(newPassword);
        await this.passwordService.createOrUpdate({ userId: user._id, password: hashed });

        console.log(`Wysyłam e-mail do: ${user.email} z hasłem: ${newPassword}`);

        return response.status(200).json({ message: 'Password reset successfully and sent via email (mock).' });
    } catch (error) {
        console.error(`Błąd resetowania hasła: ${error.message}`);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
};

private getAllUsers = async (req: Request, res: Response) => {
    const users = await this.userService.getAll();
    res.status(200).json(users);
};

}

export default UserController;
