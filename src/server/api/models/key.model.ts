import { IEntity } from 'purple-cheetah';
import { Types, Schema } from 'mongoose';

/**
 * Set of allowed values for request method.
 */
export enum KeyMethod {
  GET_ALL = 'GET_ALL',
  POST = 'POST',
  PUT = 'PUT',
  GET = 'GET',
  DELETE = 'DELETE',
}

/**
 * Defines what specific Key can do with Template/Templates.
 */
export interface KeyAccess {
  /** Refers to all Templates */
  global: {
    methods: KeyMethod[];
  };
  templates: Array<{
    /** Specific Template ID. */
    _id: string;
    /** Methods that can be executed on specified Template. */
    methods: KeyMethod[];
    /** Entry level access definition for specified Template. */
    entry: {
      methods: KeyMethod[];
    };
  }>;
  functions: Array<{
    name: string;
  }>;
}

/**
 * @ignore
 */
export interface IKey extends IEntity {
  userId: string;
  name: string;
  desc: string;
  blocked: boolean;
  secret: string;
  access: KeyAccess;
}

/**
 * Object that defines API Key.
 */
export class Key {
  constructor(
    // tslint:disable-next-line:variable-name
    public _id: Types.ObjectId,
    public createdAt: number,
    public updatedAt: number,
    /** ID of the user that created a Key. */
    public userId: string,
    /** User defined name. */
    public name: string,
    public desc: string,
    /** Is Key allowed to make API calls. */
    public blocked: boolean,
    /** Secret used for creating and verifying requests. */
    public secret: string,
    /** What API calls can Key make. */
    public access: KeyAccess,
  ) {}

  public static get schema(): Schema {
    return new Schema({
      _id: Types.ObjectId,
      createdAt: Number,
      updatedAt: Number,
      userId: String,
      name: String,
      desc: String,
      blocked: Object,
      secret: String,
      access: Object,
    });
  }

  public static get objectSchema(): any {
    const keyMethodSchema = {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'string',
      },
    };
    const keyAccessSchema = {
      __type: 'object',
      __required: true,
      __child: {
        global: {
          __type: 'object',
          __required: true,
          __child: {
            methods: keyMethodSchema,
          },
        },
        templates: {
          __type: 'array',
          __required: true,
          __child: {
            __type: 'object',
            __content: {
              _id: {
                __type: 'string',
                __required: true,
              },
              methods: keyMethodSchema,
              entry: {
                __type: 'object',
                __required: true,
                __child: {
                  methods: keyMethodSchema,
                },
              },
            },
          },
        },
        functions: {
          __type: 'array',
          __required: true,
          __child: {
            __type: 'object',
            __content: {
              name: {
                __type: 'string',
                __required: true,
              },
            },
          },
        },
      },
    };
    return {
      name: {
        __type: 'string',
        __required: true,
      },
      desc: {
        __type: 'string',
        __required: true,
      },
      blocked: {
        __type: 'boolean',
        __required: true,
      },
      access: keyAccessSchema,
    };
  }
}
