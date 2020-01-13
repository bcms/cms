import {
  Controller,
  AppLogger,
  Logger,
  Get,
  HttpErrorFactory,
  JWTEncoding,
  HttpStatus,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  StringUtility,
  Post,
  ObjectUtility,
  Put,
  Delete,
} from 'purple-cheetah';
import { Request } from 'express';
import { Webhook } from './models/webhook.model';
import { WebhookCashService } from './webhook-cash.service';
import { WebhookFactory } from './factories/webhook.factory';

@Controller('/webhook')
export class WebhookController {
  @AppLogger(WebhookController)
  private logger: Logger;

  @Get('/all')
  async getAll(request: Request): Promise<{ webhooks: Webhook[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    return {
      webhooks: WebhookCashService.findAll(),
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ webhook: Webhook }> {
    const error = HttpErrorFactory.simple('getById', this.logger);
    if (StringUtility.isIdValid(request.params.id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.params.id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const webhook = WebhookCashService.findById(request.params.id);
    if (webhook === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Webhook with ID '${request.params.id}' does not exist.`,
      );
    }
    return {
      webhook,
    };
  }

  @Post()
  async add(request: Request): Promise<{ webhook: Webhook }> {
    const error = HttpErrorFactory.simple('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          name: {
            __type: 'string',
            __required: true,
          },
          desc: {
            __type: 'string',
            __required: true,
          },
          body: {
            __type: 'string',
            __required: true,
          },
        },
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const webhook = WebhookFactory.instance;
    webhook.name = request.body.name;
    webhook.desc = request.body.desc;
    webhook.body = request.body.body;
    const addWebhookResult = await WebhookCashService.add(webhook);
    if (addWebhookResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Webhook to the database.',
      );
    }
    return {
      webhook,
    };
  }

  @Put()
  async update(request: Request): Promise<{ webhook: Webhook }> {
    const error = HttpErrorFactory.simple('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          _id: {
            __type: 'string',
            __required: true,
          },
          name: {
            __type: 'string',
            __required: true,
          },
          desc: {
            __type: 'string',
            __required: true,
          },
          body: {
            __type: 'string',
            __required: true,
          },
        },
        'body',
      );
    } catch (e) {
      throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
    }
    if (StringUtility.isIdValid(request.body._id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.body._id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const webhook = WebhookCashService.findById(request.body._id);
    if (webhook === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Webhook with ID '${request.body._id}' does not exist.`,
      );
    }
    webhook.name = request.body.name;
    webhook.desc = request.body.desc;
    webhook.body = request.body.body;
    const updateWebhookResult = await WebhookCashService.update(webhook);
    if (updateWebhookResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update Webhook in the database.',
      );
    }
    return {
      webhook,
    };
  }

  @Delete('/:id')
  async deleteById(request: Request): Promise<{ message: string }> {
    const error = HttpErrorFactory.simple('deleteById', this.logger);
    if (StringUtility.isIdValid(request.params.id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.params.id}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN],
        PermissionName.DELETE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const webhook = WebhookCashService.findById(request.params.id);
    if (webhook === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Webhook with ID '${request.params.id}' does not exist.`,
      );
    }
    const deleteWebhookResult = await WebhookCashService.deleteById(
      request.params.id,
    );
    if (deleteWebhookResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove Webhook from the database.',
      );
    }
    return {
      message: 'Success.',
    };
  }
}
