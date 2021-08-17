import { NextFunction, Request, Response, Router } from 'express';
import createHttpError from 'http-errors';
import { DeepPartial, QueryFailedError } from 'typeorm';
import { BasicDAO } from '../../data/dao/basicdao';

export default <T>(entity: new () => DeepPartial<T>): Router => {
    const dao = new BasicDAO<T>(entity);
    const router = Router();
    const entityRouter = Router();

    router.use(Reflect.getMetadata('rest-api:path', entity), entityRouter);
    entityRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const all = await dao.readAll();
            res.json(all);
        } catch (e) {
            if (!res.headersSent) {
                if (e instanceof QueryFailedError) {
                    next(createHttpError(500, (e as QueryFailedError & { detail: string }).detail));
                } else {
                    next(createHttpError(400, e as Error));
                }
            }
        }
    });

    entityRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const entity = await dao.read(req.params.id);
            res.json(entity || {});
        } catch (e) {
            if (!res.headersSent) {
                if (e instanceof QueryFailedError) {
                    next(createHttpError(500, (e as QueryFailedError & { detail: string }).detail));
                } else {
                    next(createHttpError(400, e as Error));
                }
            }
        }
    });

    entityRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const e = new entity();
            const newEntity: T = Object.assign(e, req.body);
            await dao.update(newEntity);

            res.json(newEntity || {});
        } catch (e) {
            if (!res.headersSent) {
                if (e instanceof QueryFailedError) {
                    next(createHttpError(500, (e as QueryFailedError & { detail: string }).detail));
                } else {
                    next(createHttpError(400, e as Error));
                }
            }
        }
    });

    entityRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const e = new entity();
            const newEntity: T = Object.assign(e, req.body);

            const insertedEntity = await dao.create(newEntity);

            res.json(insertedEntity);
        } catch (e) {
            if (!res.headersSent) {
                if (e instanceof QueryFailedError) {
                    next(createHttpError(500, (e as QueryFailedError & { detail: string }).detail));
                } else {
                    next(createHttpError(400, e as Error));
                }
            }
        }
    });

    entityRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
        try {
            await dao.delete(req.params.id)
            res.json({});
        } catch (e) {
            if (!res.headersSent) {
                if (e instanceof QueryFailedError) {
                    next(createHttpError(500, (e as QueryFailedError & { detail: string }).detail));
                } else {
                    next(createHttpError(400, e as Error));
                }
            }
        }
    });

    return router;
}