import { BeforeInsert, Entity, PrimaryColumn } from "typeorm";
import { randomBytes } from 'crypto';

const MIN_LENGTH = 32;

@Entity()
export class ApiKey {
    @PrimaryColumn()
    key!: string;

    @BeforeInsert()
    onBeforeInsert() {
        this.key = randomBytes(Math.ceil(MIN_LENGTH * 2 / 3)).toString('base64');
    }
}