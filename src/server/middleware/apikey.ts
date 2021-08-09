import { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError from 'http-errors';
import { data } from '../..';

export default function apiKeyAuth(check: (apikey: string) => Promise<boolean>): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
        const auth = request.headers['authorization'];
        const key = request.query['key'];

        if (!auth && (!key || typeof key !== 'string')) {
            return next(createHttpError(401, new Error(`No authorization header or key query provided.`)));
        }

        const [method, value] = auth?.split(' ') ?? ['Bearer', key as string];
        if (method !== 'Bearer') {
            return next(createHttpError(400, new Error(`API Key authentication required.`)));
        }

        if (!await check(value)) {
            return next(createHttpError(401, new Error(`Incorrect credentials provided.`)));
        }

        next();
    }
}

export async function databaseChecker(apikey: string): Promise<boolean> {
    return !!(await data.getApiKey(apikey));
}