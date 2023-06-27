import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import type {
  HTTPError,
  Logger,
  ObjectSchema,
} from '@becomes/purple-cheetah/types';
import type { Request } from 'express';
import type { BCMSApiKey } from '../../api';
import type { BCMSUserCustomPool } from '../../user';

export interface BCMSFunctionConfig {
  /**
   * Will be converted to lowercase without
   * special characters and spaces will be
   * replaced with "-".
   */
  name: string;
  /**
   * If set to "true", anyone can call this
   * function. Defaults to "false".
   */
  public?: boolean;
}
export const BCMSFunctionConfigSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  public: {
    __type: 'boolean',
    __required: false,
  },
};

export interface BCMSFunction<Result> {
  config: BCMSFunctionConfig;
  handler(data: {
    request: Request;
    errorHandler: HTTPError;
    logger: Logger;
    auth: BCMSApiKey | JWT<BCMSUserCustomPool>;
  }): Promise<Result>;
}
export const BCMSFunctionSchema: ObjectSchema = {
  config: {
    __type: 'object',
    __required: true,
    __child: BCMSFunctionConfigSchema,
  },
  handler: {
    __type: 'function',
    __required: true,
  },
};
