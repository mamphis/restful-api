import express, { Application, Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import moment from "moment";
import { features } from "..";
import { Customer } from "../model/customer";
import { OpenAPIGenerator } from "../openapi/generator";
import basicAuth, { databaseChecker } from "./middleware/basicauth";
import router from "./routes/router";

export class Server {
    private app: Application;

    constructor(private port: number) {
        this.app = express();
        this.route();
    }

    route() {
        this.app.use(express.json());
        this.app.use(basicAuth(databaseChecker));

        this.app.use(async (req: Request, res: Response, next: NextFunction) => {
            if (!features.enableVerboseLogging) {
                return next();
            }

            const start = moment();
            await next();
            const end = moment();

            console.log(`(${end.diff(start)}ms) [${req.method}] ${req.originalUrl} => ${res.statusCode} ${res.statusMessage} ${req.method === 'POST' ? JSON.stringify(req.body) : ''}`);
        });

        OpenAPIGenerator.it.withDoc().use(this.app, this.port, Customer);

        this.app.use((req: Request, res: Response, next: NextFunction) => {
            return next(createHttpError(404));
        });

        // error handler
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            let statusToSend = 500;
            if ('status' in err) {
                statusToSend = err.status;
            }

            console.log(`(ERR)  [${req.method}] ${req.originalUrl} => ${statusToSend} ${err.message}`);
            res.status(statusToSend).json({ error: true, status: statusToSend, errorName: err.name, message: err.message });
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is listening on port: ${this.port}`);
        });
    }
}
