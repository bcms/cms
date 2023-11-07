export interface OpenApiInfo {
  version: string;
  title: string;
  description: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
}

export interface OpenApiServer {
  url: string;
  description: string;
}

export interface OpenApiSchema {
  type?: string;
  items?: OpenApiSchema;
  properties?: {
    [name: string]: OpenApiSchema;
  };
  $ref?: string;
  enum?: string[];
  required?: string[];
  format?: string;
  oneOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
  additionalProperties: OpenApiSchema;
  'x-name'?: string;
}

export interface OpenApiPath {
  [type: string]: {
    tags?: string[];
    summary?: string;
    description?: string;
    parameters: OpenApiPathParam[];
    security: Array<{
      [name: string]: unknown;
    }>;
    requestBody: {
      required: boolean;
      content: {
        [contentType: string]: {
          schema: OpenApiSchema;
        };
      };
    };
    responses: {
      [code: string]: {
        description: string;
        content: {
          [contentType: string]: {
            schema: OpenApiSchema;
          };
        };
      };
    };
  };
}

export interface OpenApiPathParam {
  in: string;
  name: string;
  schema: OpenApiSchema;
  required: boolean;
  description?: string;
  enum?: string[];
}

export interface OpenApiComponents {
  [name: string]: OpenApiSchema;
}

export interface OpenApiSecurity {
  type: string;
  scheme: string;
  inputs?: string[];
  'x-handler'?: string;
}

export interface OpenApiSocketServerSecurity {
  name: string;
  in: string;
  as: string;
}

export interface OpenApiSocketServer {
  domain: string;
  path: string;
  security?: OpenApiSocketServerSecurity[];
  description?: string;
}

export interface OpenApiSocketListener {
  description?: string;
  summary?: string;
  schema: OpenApiSchema;
}

export interface OpenApiSocketEmit {
  description?: string;
  summary?: string;
  schema: OpenApiSchema;
}

export interface OpenApiSocket {
  servers: OpenApiSocketServer[];
  listeners?: { [name: string]: OpenApiSocketListener };
  emits?: { [name: string]: OpenApiSocketEmit };
}

export interface OpenApi {
  openapi?: string;
  info: OpenApiInfo;
  servers: OpenApiServer[];
  paths: {
    [name: string]: OpenApiPath;
  };
  'x-socket'?: OpenApiSocket;
  components: {
    schemas: OpenApiComponents;
    securitySchemes: {
      [name: string]: OpenApiSecurity;
    };
  };
}
