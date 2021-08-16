import reflect from 'reflect-metadata';
import dotenv from 'dotenv';
import { argv } from 'process';
import { IDatabase } from './data/idatabase';
import { SQLiteDatabase } from './data/sqlite';
import { Server } from './server/server';
import { Customer } from './model/customer';

dotenv.config();
export type SQLConnection = 'sqlite' | 'mysql';
export type Features = {
    enableVerboseLogging: boolean,
    connection: SQLConnection,
};

export const features: Features = {
    enableVerboseLogging: true,
    connection: 'sqlite',
};

function getDatabase(): IDatabase {
    switch (features.connection) {
        case 'sqlite':
            const databaseFile = process.env.DATABASE_FILE;
            if (!databaseFile) {
                throw new Error(`Missing environment variable "DATABASE_FILE"`);
            }

            return new SQLiteDatabase(databaseFile);
        default:
            throw new Error('Not configured');
    }
}


export const data: IDatabase = getDatabase();
data.init().then(async () => {

    if (argv.includes('--basic')) {
        // Create a new user
        const username = argv[argv.indexOf('--basic') + 1];
        const password = argv[argv.indexOf('--basic') + 2];

        if (username && password) {
            const user = await data.addBasicUser(username, password);
            console.log(`Created user:
Username: ${user.username}
Password: ${password} => ${user.password}`);
        } else {
            return console.warn(`Please provide arguments username and password after the --basic argument`);
        }
    } else if (argv.includes('--apikey')) {
        // Create an api key

        const apiKey = await data.addApiKey();
        console.log(`Created Apikey:
API Key: ${apiKey.key}`);
    } else {
        // Start the normal server.

        const port = parseInt(process.env.PORT ?? `8005`);
        const server = new Server(port);
        server.start();
    }
});
