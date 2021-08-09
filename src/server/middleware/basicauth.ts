import { NextFunction, Request, RequestHandler, Response } from 'express';
import createHttpError from 'http-errors';
import { compare } from 'bcrypt';
import { data } from '../..';

export default function basicAuth(check: (username: string, password: string) => Promise<boolean>): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
        const auth = request.headers['authorization'];

        if (!auth) {
            return next(createHttpError(401, new Error(`No authorization header provided.`)));
        }

        const [method, value] = auth.split(' ');
        if (method !== 'Basic') {
            return next(createHttpError(400, new Error(`Basic authentication required.`)));
        }

        const [user, password] = Buffer.from(value, 'base64').toString('ascii').split(':');
        if (!await check(user, password)) {
            return next(createHttpError(401, new Error(`Incorrect credentials provided.`)));
        }

        next();
    }
}

export async function databaseChecker(username: string, password: string): Promise<boolean> {
    const user = await data.getUser(username);
    if (!user) {
        return false;
    }

    return compare(password, user.password);
}