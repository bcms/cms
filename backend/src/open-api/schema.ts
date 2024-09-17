import type { OpenAPIV3 } from 'openapi-types';
import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import type { OpenApiModelNames } from '@bcms/selfhosted-backend/open-api/main';

export function objectSchemaToOpenApi3Schema(
    schema: ObjectSchema,
): OpenAPIV3.SchemaObject {
    const output: OpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {},
        required: [],
    };
    Object.keys(schema).map((propName) => {
        const prop = schema[propName];
        if (prop.__required) {
            (output.required as string[]).push(propName);
        }
        if (prop.__type === 'object' && prop.__child) {
            (output.properties as { [name: string]: OpenAPIV3.SchemaObject })[
                propName
            ] = objectSchemaToOpenApi3Schema(prop.__child as ObjectSchema);
        } else if (prop.__type === 'array' && prop.__child) {
            if (prop.__child.__type === 'object') {
                if (!prop.__child.__content) {
                    throw Error(
                        `No content for child in prop -> ${propName} -> ${JSON.stringify(
                            schema,
                            null,
                            '  ',
                        )}`,
                    );
                }
                const child = objectSchemaToOpenApi3Schema(
                    prop.__child.__content as ObjectSchema,
                );
                (
                    output.properties as {
                        [name: string]: OpenAPIV3.SchemaObject;
                    }
                )[propName] = {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: child.properties,
                        required: child.required,
                    },
                };
            } else {
                (
                    output.properties as {
                        [name: string]: OpenAPIV3.SchemaObject;
                    }
                )[propName] = {
                    type: 'array',
                    items: {
                        type: prop.__child
                            .__type as OpenAPIV3.NonArraySchemaObjectType,
                    },
                };
            }
        } else {
            (output.properties as { [name: string]: OpenAPIV3.SchemaObject })[
                propName
            ] = {
                type: prop.__type as OpenAPIV3.NonArraySchemaObjectType,
            };
        }
    });
    if (output.required && output.required.length === 0) {
        delete output.required;
    }
    return output;
}

export function openApiGetObjectRefSchema(
    refs: OpenApiModelNames | OpenApiModelNames[],
): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject {
    if (refs instanceof Array) {
        return {
            oneOf: refs.map((ref) => {
                return { $ref: `#/components/schemas/${ref}` };
            }),
        };
    }
    return {
        $ref: `#/components/schemas/${refs}`,
    };
}

export function controllerItemsResponseDefinitionForRef(
    refs: OpenApiModelNames | OpenApiModelNames[],
): OpenAPIV3.SchemaObject {
    const obj: ObjectSchema = {
        total: {
            __type: 'number',
            __required: true,
        },
        offset: {
            __type: 'number',
            __required: true,
        },
        limit: {
            __type: 'number',
            __required: true,
        },
    };
    const result = objectSchemaToOpenApi3Schema(obj);
    (result.required as string[]).push('items');
    if (refs instanceof Array) {
        (
            result.properties as { [name: string]: OpenAPIV3.SchemaObject }
        ).items = {
            type: 'array',
            items: {
                oneOf: [],
            },
        };
        for (let i = 0; i < refs.length; i++) {
            const ref = refs[i];
            (result.properties as any).items.items.oneOf.push({
                $ref: `#/components/schemas/${ref}`,
            });
        }
    } else {
        (
            result.properties as { [name: string]: OpenAPIV3.SchemaObject }
        ).items = {
            type: 'array',
            items: {
                $ref: `#/components/schemas/${refs}`,
            },
        };
    }
    return result;
}

export function controllerItemResponseDefinitionForRef(
    refs: OpenApiModelNames | OpenApiModelNames[],
): OpenAPIV3.SchemaObject {
    if (refs instanceof Array) {
        return {
            type: 'object',
            properties: {
                item: {
                    oneOf: refs.map((ref) => {
                        return { $ref: `#/components/schemas/${ref}` };
                    }),
                },
            },
            required: ['item'],
        };
    }
    return {
        type: 'object',
        properties: {
            item: {
                $ref: `#/components/schemas/${refs}`,
            },
        },
        required: ['item'],
    };
}

// export function openApiGetModelRef(name: OpenApiModelNames) {
//   return `#/components/schemas/${name}`;
// }

export function openApiCreateSchema(schema: OpenAPIV3.SchemaObject) {
    return schema;
}

export function openApiGetModelRef(name: OpenApiModelNames) {
    return `#/components/schemas/${name}`;
}
