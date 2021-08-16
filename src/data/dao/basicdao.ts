import { EntityManager, EntityTarget, getConnection } from "typeorm";
import { IGenericDAO, ITransactionDAO } from "../idatabase";

export class BasicDAO<T> implements IGenericDAO<T>, ITransactionDAO {
    private manager: EntityManager | undefined;

    protected get repo() {
        if (this.manager) {
            const repository = this.manager.getRepository(this.repoType);
            this.manager = undefined;
            return repository;
        }

        return getConnection().getRepository(this.repoType);
    }

    setEntityManager(manager: EntityManager): this {
        this.manager = manager;
        return this;
    }

    constructor(private repoType: EntityTarget<T>) {
    }


    async create(entity: T): Promise<T> {
        return this.repo.save(entity);
    }

    async readAll(): Promise<T[]> {
        return this.repo.find();
    }

    async read(id: string): Promise<T | undefined> {
        return this.repo.findOne(id);
    }

    async update(entity: T): Promise<void> {
        await this.repo.save(entity);
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }


}