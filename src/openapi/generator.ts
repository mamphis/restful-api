type methods = Partial<'get' | 'post' | 'put' | 'delete'>;
type statusCodes = '200';
type contentTypes = 'application/json';
type schemaTypes = 'array' | 'object';
type parameterLocation = 'query' | 'header' | 'path' | 'cookie';
type propertyInfoType = 'string' | 'boolean' | 'number' | 'integer';

type objectSchema = {
    type: 'object',
    $ref: string;
}

type arraySchema = {
    type: 'array',
    items: {
        $ref: string;
    }
};

type schema = objectSchema | arraySchema;

type pathInfo = {
    [route: string]: {
        [method in methods]: undefined | {
            description?: string;
            requestBody?: {
                $ref: string,
            },
            parameters?: Array<{
                name: string,
                in: parameterLocation,
                required: boolean,
                schema: {
                    type: propertyInfoType
                }
            }>,
            responses: {
                [code in statusCodes]: {
                    description?: string;
                    content: {
                        [contentType in contentTypes]: {
                            schema: schema
                        }
                    }
                }
            }
        }
    }
};

type numberPropertyInfo = {
    type: 'number',
    format?: 'float' | 'double',
}

type intPropertyInfo = {
    type: 'integer',
    format?: 'int32' | 'int64';
}

type stringPropertyInfo = {
    type: 'string',
    format?: 'date' | 'date-time' | 'password' | 'byte' | 'binary';
}

type boolPropertyInfo = {
    type: 'boolean';
}

type propertyInfo = numberPropertyInfo | intPropertyInfo | stringPropertyInfo | boolPropertyInfo;

type schemaInfo = {
    type: schemaTypes,
    required?: string[],
    properties?: {
        [name: string]: propertyInfo;
    }
};

type entity = {
    paths: pathInfo
    components: {
        schemas: {
            [name: string]: schemaInfo
        },
        requestBodies: {
            [name: string]: {
                content: {
                    [contentType in contentTypes]: {
                        schema: {
                            $ref: string;
                        }
                    }
                }
            }
        }
    }
};

export class OpenAPIGenerator {
    print() {
        console.log(JSON.stringify(this.classes, undefined, 2));
    }

    private static instance: OpenAPIGenerator;
    private path: string = '/api';
    private classes: { [name: string]: entity } = {};

    public static get it(): OpenAPIGenerator {
        if (!this.instance) {
            this.instance = new OpenAPIGenerator('3.1');
        }

        return this.instance;
    }

    private constructor(private version: string) {

    }

    addClass(path: string, name: string) {

        const getResponse = (type: schemaTypes) => {
            let schema: schema;
            if (type == 'object') {
                schema = {
                    type, $ref: `#/components/schemas/${name}`
                }
            } else {
                schema = { type, items: { $ref: `#/components/schemas/${name}` } };
            }
            return {
                '200': {
                    description: '',
                    content: {
                        'application/json': {
                            schema,
                        }
                    }
                }
            }
        };

        const paths: pathInfo = {};
        paths[path] = {
            'get': {
                description: '',
                responses: getResponse('array'),
            },
            'delete': undefined,
            post: {
                description: '',
                responses: getResponse('object'),
                requestBody: {
                    '$ref': `#/components/requestBodies/${name}`
                }
            },
            put: {
                description: '',
                responses: getResponse('object'),
                requestBody: {
                    '$ref': `#/components/requestBodies/${name}`
                }
            },
        }
        paths[path + '/{id}'] = {
            get: {
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                }],
                responses: getResponse('object'),
            },
            delete: {
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                    },
                }],
                responses: {
                    "200": {
                        description: '',
                        content: {
                            "application/json": {
                                schema: {
                                    type: 'object',
                                    $ref: '#/components/schemas/empty'
                                }
                            }
                        }
                    }
                },
            },

            post: undefined,
            put: undefined,
        }
        if (this.classes[name]) {
            this.classes[name].paths = paths;
        } else {
            this.classes[name] = {
                paths,
                components: { schemas: {}, requestBodies: {} }
            }
        }
    }

    addProperty(className: string, property: string, type: string) {
        let t: propertyInfoType = 'string';
        let f: undefined | any = undefined;
        switch (type.toLowerCase()) {
            case 'date':
                t = 'string';
                f = 'date-time';
        }

        if (this.classes[className]) {
            if (this.classes[className].components.schemas[className]) {
                if (this.classes[className].components.schemas[className].properties) {
                    this.classes[className].components.schemas[className].properties![property] = {
                        type: t,
                        format: f,
                    };
                } else {
                    this.classes[className].components.schemas[className].properties = {
                        [property]: {
                            type: t,
                            format: f,
                        }
                    };
                }
            } else {
                this.classes[className].components.schemas[className] = {
                    type: 'object',
                    required: [property],
                    properties: {
                        [property]: {
                            type: t,
                            format: f,
                        }
                    }
                }
            }
        } else {
            this.classes[className] = {
                paths: {},
                components: {
                    schemas: {
                        [className]: {
                            type: 'object',
                            required: [property],
                            properties: {
                                [property]: {
                                    type: t,
                                    format: f
                                }
                            }
                        },
                        'empty': {
                            type: 'object',
                        }
                    },
                    requestBodies: {
                        [className]: {
                            content: {
                                'application/json': {
                                    schema: {
                                        '$ref': '#/components/schemas/' + className
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    set basePath(path: string) {
        this.path = path;
    }

    get basePath(): string {
        return this.path;
    }
}