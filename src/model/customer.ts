import { AfterLoad, Column, Entity, PrimaryColumn } from "typeorm";
import { OpenAPIClass, OpenAPIProperty } from "../openapi/decorators";

@Entity() @OpenAPIClass('/customers')
export class Customer {
    @OpenAPIProperty() @PrimaryColumn()
    customerNo!: string;

    @OpenAPIProperty() @Column({ default: '' })
    firstName!: string;

    @OpenAPIProperty() @Column({ default: '' })
    lastName!: string;

    @OpenAPIProperty() @Column({ default: '' })
    address!: string;

    @OpenAPIProperty() @Column({ default: '' })
    postCode!: string;

    @OpenAPIProperty() @Column({ default: '' })
    city!: string;

    @OpenAPIProperty() @Column({ default: '' })
    country!: string;

    @OpenAPIProperty()
    name!: string;

    @AfterLoad()
    private onAfterLoad() {
        this.name = `${this.firstName} ${this.lastName}`;
    }
}