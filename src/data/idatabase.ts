import { EntityManager } from "typeorm";
import { ApiKey } from "../model/apikey";
import { User } from '../model/user';

export interface IDatabase {
    init(): Promise<void>;
    addBasicUser(username: string, password: string): Promise<User>;
    getUser(username: string): Promise<User | undefined>;
    addApiKey(): Promise<ApiKey>;
    getApiKey(key: string): Promise<ApiKey | undefined>;

    transaction(runInTransaction: (manager: EntityManager) => Promise<void>): Promise<void>;
}

export interface ITransactionDAO {
    setEntityManager(manager: EntityManager): this;
}

export interface IGenericDAO<T> {
    create(entity: T): Promise<T>;
    readAll(): Promise<T[]>;
    read(id: string): Promise<T | undefined>;
    update(entity: T): Promise<void>;
    delete(id: string): Promise<void>;
};