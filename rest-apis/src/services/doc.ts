import { v4 as uuidv4 } from 'uuid';
import { NavItem } from '../components';
import { ObjectSchema } from '@banez/object-utility/types';
import { OpenApiUtil, StringUtil } from '../util';
import { securityStore } from '../store';
import { OpenApi, OpenApiPathParam, OpenApiSchema } from '../types';

export type DocSectionParamType = 'path' | 'query' | 'header';
export interface DocSectionParam {
  id: string;
  type: DocSectionParamType;
  name: string;
  prettyName: string;
  value: string;
  err: string;
  required: boolean;
  description?: string;
  enum?: string[];
}

export type DocSectionRequestBodyType =
  | 'application/json'
  | 'multipart/form-data';
export interface DocSectionRequestBody {
  type: DocSectionRequestBodyType;
  required: boolean;
  visualSchema: string;
  jsonObjectSchema?: ObjectSchema;
  value: any;
  err: string;
}

export type DocSectionResponseType = 'application/json' | 'file';
export interface DocSectionResponse {
  code: string;
  description: string;
  type: DocSectionResponseType;
  visualSchema: string;
  value: string;
  err: string;
}

export interface DocSecurity {
  name: string;
  values: string[];
  handlerPath: string;
  handler?: (config: any) => Promise<any>;
}

export interface DocSection {
  id: string;
  loading: boolean;
  extend: boolean;
  method: string;
  path: string;
  summary?: string;
  description?: string;
  security?: DocSecurity[];
  params: {
    query: DocSectionParam[];
    header: DocSectionParam[];
    path: DocSectionParam[];
  };
  selectedRequestBodyType: DocSectionRequestBodyType;
  requestBodies: DocSectionRequestBody[];
  selectedResponseType: DocSectionResponseType;
  responses: DocSectionResponse[];
}

export interface DocGroup {
  name: string;
  extend: boolean;
  sections: DocSection[];
}

export interface DocComponent {
  id: string;
  name: string;
  extended: boolean;
  visualSchema: string;
}

function extractParams(
  type: DocSectionParamType,
  params?: OpenApiPathParam[]
): DocSectionParam[] {
  const output: DocSectionParam[] = [];
  if (params) {
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      if (param.in === type) {
        const schema = param.schema as OpenApiSchema;
        const anySchema = param.schema as any;
        output.push({
          id: uuidv4(),
          err: '',
          name: param.name,
          prettyName: StringUtil.toPretty(param.name),
          required: param.required || false,
          type: param.in as DocSectionParamType,
          value: '',
          enum: schema.enum
            ? schema.enum
            : anySchema.items && anySchema.items.enum
            ? anySchema.items.enum
            : undefined,
          description: param.description || '',
        });
      }
    }
  }
  return output;
}

export class Doc {
  static base = '';
  static doc: OpenApi;

  static createNav(docs: OpenApi): NavItem[] {
    const output: NavItem[] = [];
    const map: {
      [group: string]: {
        [path: string]: Array<{
          method: string;
          href: string;
        }>;
      };
    } = {};
    if (docs.paths) {
      for (const pathName in docs.paths) {
        const path = docs.paths[pathName];
        for (const m in path) {
          const method = m as 'post';
          const data = path[method];
          if (data && data.tags) {
            for (let i = 0; i < data.tags.length; i++) {
              const tag = data.tags[i];
              if (!map[tag]) {
                map[tag] = {};
              }
              if (!map[tag][pathName]) {
                map[tag][pathName] = [];
              }
              map[tag][pathName].push({
                href: `${method.toLowerCase()}-${pathName
                  .slice(1)
                  .replace(/\//g, '-')}`,
                method,
              });
            }
          }
        }
      }
      for (const group in map) {
        const mapGroup = map[group];
        const parentIndex =
          output.push({
            name: group,
            showChildren: false,
            children: [],
          }) - 1;
        for (const path in mapGroup) {
          const mapPath = mapGroup[path];
          const pathIndex =
            (output[parentIndex].children as NavItem[]).push({
              name: path,
              showChildren: false,
              children: [],
            }) - 1;
          for (let i = 0; i < mapPath.length; i++) {
            const endpoint = mapPath[i];
            (
              (output[parentIndex].children as NavItem[])[pathIndex]
                .children as NavItem[]
            ).push({
              method: endpoint.method.toUpperCase(),
              href: endpoint.href,
            });
          }
        }
      }
    }
    if (docs['x-socket']) {
      const outputIndex =
        output.push({
          name: 'Socket',
          children: [],
          showChildren: false,
        }) - 1;
      if (docs['x-socket'].listeners) {
        for (const name in docs['x-socket'].listeners) {
          output[outputIndex].children?.push({
            href: `soclis-${name}`,
            method: '<--- ' + name,
          });
        }
      }
      if (docs['x-socket'].emits) {
        for (const name in docs['x-socket'].emits) {
          output[outputIndex].children?.push({
            href: `socemit-${name}`,
            method: '---> ' + name,
          });
        }
      }
    }
    if (docs.components?.schemas) {
      const outputIndex =
        output.push({
          name: 'Components',
          children: [],
        }) - 1;
      for (const compName in docs.components.schemas) {
        output[outputIndex].children?.push({
          href: `model-${compName}`,
          method: compName,
        });
      }
      output[outputIndex].children?.sort((a, b) =>
        a.method + '' < b.method + '' ? -1 : 1
      );
    }
    return output;
  }

  static createGroups(docs: OpenApi): DocGroup[] {
    const output: DocGroup[] = [];
    const groups: {
      [name: string]: DocSection[];
    } = {};
    for (const pathName in docs.paths) {
      const path = docs.paths[pathName];
      for (const m in path) {
        const methodName = m as 'post';
        const method = path[methodName];
        if (method?.tags) {
          for (let i = 0; i < method.tags.length; i++) {
            const tag = method.tags[i];
            if (!groups[tag]) {
              groups[tag] = [];
            }
            groups[tag].push({
              id: `${methodName}${pathName.replace(/\//g, '-')}`,
              loading: false,
              extend: false,
              method: methodName,
              summary: method.summary || '',
              path: pathName,
              description: method.description || '',
              security: method.security
                ? (method.security
                    .map((item) => {
                      const name = Object.keys(item)[0];
                      const docSec = (docs.components?.securitySchemes as any)[
                        name
                      ];
                      if (docSec) {
                        securityStore.value[name] = {
                          prettyName: StringUtil.toPretty(name),
                          type: docSec.type,
                          schema: docSec.scheme,
                          value: (item[name] as any)[0]
                            ? `${(item[name] as any)[0]}`
                            : '',
                        };
                        const sec: DocSecurity = {
                          name,
                          values: [],
                          handlerPath: (docSec as any)['x-handler']
                            ? (docSec as any)['x-handler']
                            : '',
                        };
                        return sec;
                      } else {
                        return null;
                      }
                    })
                    .filter((e) => e) as DocSecurity[])
                : [],
              params: {
                header: extractParams('header', method.parameters),
                path: extractParams('path', method.parameters),
                query: extractParams('query', method.parameters),
              },
              requestBodies: method.requestBody
                ? Object.keys(method.requestBody.content).filter(
                    (bodyType) =>
                      bodyType === 'application/json' ||
                      bodyType === 'multipart/form-data'
                  ).length > 0
                  ? Object.keys(method.requestBody.content)
                      .filter(
                        (bodyType) =>
                          bodyType === 'application/json' ||
                          bodyType === 'multipart/form-data'
                      )
                      .map((bodyType) => {
                        const body = method.requestBody.content[bodyType];
                        const bodySchema = OpenApiUtil.parseSchema(
                          body.schema,
                          docs.components.schemas,
                          undefined,
                          0
                        );
                        let value: any = undefined;
                        if (bodyType === 'application/json') {
                          value = JSON.stringify(bodySchema.json, null, '  ');
                        } else if (
                          bodyType === 'multipart/form-data' &&
                          body.schema.properties
                        ) {
                          value = Object.keys(body.schema.properties).map(
                            (key) => {
                              const prop = body.schema.properties
                                ? body.schema.properties[key]
                                : ({} as any);
                              return {
                                name: key,
                                type: prop.type,
                                format: prop.format,
                              };
                            }
                          );
                        }
                        return {
                          err: '',
                          value,
                          visualSchema: bodySchema.visualSchema,
                          required: !!method.requestBody.required,
                          type: bodyType as DocSectionRequestBodyType,
                          jsonObjectSchema:
                            bodySchema.objectSchema as ObjectSchema,
                        };
                      })
                  : [
                      {
                        err: '',
                        required: false,
                        type: 'application/json',
                        value: '',
                        visualSchema: '',
                        jsonObjectSchema: {},
                      },
                    ]
                : [
                    {
                      err: '',
                      required: false,
                      type: 'application/json',
                      value: '',
                      visualSchema: '',
                      jsonObjectSchema: {},
                    },
                  ],
              responses: method.responses
                ? Object.keys(method.responses).filter(
                    (statusCode) => statusCode === '200'
                  ).length > 0
                  ? Object.keys(method.responses)
                      .filter((statusCode) => statusCode === '200')
                      .map((statusCode) => {
                        const output: DocSectionResponse[] = [];
                        for (const resType in method.responses[statusCode]
                          .content) {
                          const res =
                            method.responses[statusCode].content[resType];
                          const resSchema = OpenApiUtil.parseSchema(
                            res.schema,
                            docs.components.schemas,
                            undefined,
                            0
                          );
                          output.push({
                            code: statusCode,
                            description: method.description || '',
                            err: '',
                            type: resType as DocSectionResponseType,
                            value: '',
                            visualSchema: resSchema.visualSchema,
                          });
                        }
                        return output;
                      })
                      .reduce((p, c) => {
                        return [...p, ...c];
                      }, [])
                  : [
                      {
                        code: '200',
                        description: 'OK',
                        err: '',
                        type: 'application/json',
                        value: '',
                        visualSchema: '',
                      },
                    ]
                : [
                    {
                      code: '200',
                      description: 'OK',
                      err: '',
                      type: 'application/json',
                      value: '',
                      visualSchema: '',
                    },
                  ],
              selectedRequestBodyType: 'application/json',
              selectedResponseType: 'application/json',
            });
          }
        }
      }
    }
    for (const groupName in groups) {
      output.push({
        name: groupName,
        extend: true,
        sections: groups[groupName],
      });
    }
    return output;
  }

  static createComponents(docs: OpenApi): {
    items: DocComponent[];
    extended: boolean;
  } {
    const output: DocComponent[] = [];
    if (docs.components && docs.components.schemas) {
      for (const compName in docs.components.schemas) {
        const comp = docs.components.schemas[compName];
        const parsed = OpenApiUtil.parseSchema(
          comp,
          docs.components.schemas,
          undefined,
          0,
          [`#/components/schemas/${compName}`]
        );
        output.push({
          id: `model-${compName}`,
          name: compName,
          extended: false,
          visualSchema: parsed.visualSchema,
        });
      }
    }
    return {
      items: output.sort((a, b) => (a.name < b.name ? -1 : 1)),
      extended: true,
    };
  }
}
