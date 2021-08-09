import { createConnection, EntityManager, getConnection, LoggerOptions } from 'typeorm';
import { ApiKey } from '../model/apikey';
import { User } from '../model/user';
import { IDatabase } from './idatabase';
import { hash } from 'bcrypt';
import { features } from '..';

export class SQLiteDatabase implements IDatabase {
    constructor(private databaseFile: string) {
    }

    async init() {
        const logging: LoggerOptions = features.enableVerboseLogging ? ['info'] : [];
        const conn = await createConnection({
            type: 'sqlite',
            database: this.databaseFile,
            entities: [
                'out/model/**/*{.ts,.js}',
            ],
            logging: [
                'warn',
                'error',
                ...logging,
            ]
        });


        await conn.query('PRAGMA foreign_keys=OFF');
        await conn.synchronize();
        await conn.query('PRAGMA foreign_keys=ON');
    }

    async addBasicUser(username: string, password: string): Promise<User> {
        const pass = await hash(password, 10);
        return getConnection().getRepository(User).create({ username, password: pass });
    }

    async getUser(username: string): Promise<User | undefined> {
        return getConnection().getRepository(User).findOne({ username });
    }

    async addApiKey(): Promise<ApiKey> {
        return getConnection().getRepository(ApiKey).create();
    }

    async getApiKey(key: string): Promise<ApiKey | undefined> {
        return getConnection().getRepository(ApiKey).findOne({ key });
    }

    async transaction(runInTransaction: (manager: EntityManager) => Promise<void>): Promise<void> {
        await getConnection().transaction(runInTransaction);
    }
}