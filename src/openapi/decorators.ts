import { OpenAPIGenerator } from "./generator";

export function OpenAPIClass(path: string) {
    return (target: Function) => {
        console.log('adding class ' + target.name);
        OpenAPIGenerator.it.addClass(path, target.name);
        Reflect.defineMetadata('rest-api:path', path, target);
    }
}

export function OpenAPIProperty() {
    return (target: Object, key: string) => {
        console.log('adding property ' + target.constructor.name);
        const prop = Reflect.getMetadata("design:type", target, key);
        OpenAPIGenerator.it.addProperty(target.constructor.name, key, prop.name);
    }
}