import App from './app';
import ItemController from './controllers/item.controller';
import IndexController from './controllers/index.controller';
import DataController from './controllers/data.controller';

const app = new App([]);
const io = app.getIo();

const controllers = [
    new DataController(io),
    new IndexController(io),
    new ItemController(io),
];

controllers.forEach(controller => {
    app.app.use("/", controller.router);
});

app.listen();