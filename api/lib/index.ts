import App from './app';
import IndexController from "./controllers/index.controller";
import DataController from './controllers/data.controller';
import UserController from './controllers/user.controller';

import UserService from './modules/services/user.service';
import PasswordService from './modules/services/password.service';
import TokenService from './modules/services/token.service';
import DataService from './modules/services/data.service';


const userService = new UserService();
const passwordService = new PasswordService();
const tokenService = new TokenService();
const dataService = new DataService();

const app: App = new App([
    new UserController(userService, passwordService, tokenService),
    new DataController(dataService),
    new IndexController()
]);

app.listen();