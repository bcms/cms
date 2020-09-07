import {
  AppLogger,
  Logger,
  Service,
  Controller,
  Get,
  HttpErrorFactory,
  RoleName,
  JWTEncoding,
  HttpStatus,
  JWTSecurity,
  PermissionName,
  JWTConfigService,
  StringUtility,
  Post,
  ObjectUtility,
  Put,
  Delete,
} from 'purple-cheetah';
import { TemplateService } from './template.service';
import { Request } from 'express';
import { Template, TemplateType } from './models/template.model';
import { TemplateFactory } from './factories/template.factory';
import { PropUtil } from '../prop/prop-util';
import { GroupService } from '../group/group.service';
// import { EntryService } from '../entry/entry.service';
import { APISecurity } from '../api/api-security';
import { TemplateLite } from './interfaces/template-lite.interface';
import { TemplateChanges } from './interfaces/changes.interface';
import { PropChanges } from '../prop/interfaces/prop-changes.interface';
import { CacheControl } from '../cache-control';

/**
 * Controller that provides CRUD for Template object.
 */
@Controller('/template')
export class TemplateController {
  @AppLogger(TemplateController)
  private logger: Logger;
  /** Service that handles interaction with Template objects in database. */
  @Service(TemplateService)
  private templateService: TemplateService;
  /** Service that handles interaction with Group objects in database. */
  @Service(GroupService)
  private groupService: GroupService;
  /** Service that handles interaction with Entry objects in database. */
  // @Service(EntryService)
  // private entryService: EntryService;

  /** Return all Template objects. */
  @Get('/all')
  async getAll(request: Request): Promise<{ templates: Template[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    const query: any = request.query;
    if (query.signature) {
      try {
        APISecurity.verify(
          query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
        );
      } catch (e) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, e.message);
      }
    } else {
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
    }
    let templates: Template[];
    if (request.params.ids) {
      const ids = request.params.ids.split('-');
      ids.forEach((id) => {
        if (StringUtility.isIdValid(id) === false) {
          throw error.occurred(
            HttpStatus.FORBIDDEN,
            `Invalid ID '${id}' was provided.`,
          );
        }
      });
      templates = await this.templateService.findAllById(ids);
    } else {
      templates = await this.templateService.findAll();
    }
    return {
      templates,
    };
  }

  /** Return all Template objects in lite form. */
  @Get('/all/lite')
  async getAllLite(request: Request): Promise<{ templates: TemplateLite[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    const query: any = request.query;
    if (query.signature) {
      try {
        APISecurity.verify(
          query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
        );
      } catch (e) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, e.message);
      }
    } else {
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
    }
    let templates: TemplateLite[];
    if (request.params.ids) {
      const ids = request.params.ids.split('-');
      ids.forEach((id) => {
        if (StringUtility.isIdValid(id) === false) {
          throw error.occurred(
            HttpStatus.FORBIDDEN,
            `Invalid ID '${id}' was provided.`,
          );
        }
      });
      templates = await this.templateService.findAllLiteById(ids);
    } else {
      templates = await this.templateService.findAllLite();
    }
    return {
      templates,
    };
  }

  /** Returns a specific Template object. */
  @Get('/:id')
  async getById(request: Request): Promise<{ template: Template }> {
    const error = HttpErrorFactory.simple('getById', this.logger);
    const query: any = request.query;
    if (StringUtility.isIdValid(request.params.id) === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Invalid ID '${request.params.id}' was provided.`,
      );
    }
    if (query.signature) {
      try {
        APISecurity.verify(
          query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
        );
      } catch (e) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, e.message);
      }
    } else {
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
    }
    const template = await this.templateService.findById(request.params.id);
    if (template === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Template with ID '${request.params.id}' does now exist.`,
      );
    }
    return {
      template,
    };
  }

  /** Creates a new Template object. */
  @Post()
  async add(request: Request): Promise<{ template: Template }> {
    const error = HttpErrorFactory.simple('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        request.body,
        {
          type: {
            __type: 'string',
            __required: true,
          },
          name: {
            __type: 'string',
            __required: true,
          },
          desc: {
            __type: 'string',
            __required: false,
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
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    if (!TemplateType[request.body.type]) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Type '${request.body.type}' is not allowed.`,
      );
    }
    const template = TemplateFactory.instance;
    template.type = TemplateType[request.body.type];
    template.name = StringUtility.createSlug(request.body.name);
    template.userId = jwt.payload.userId;
    template.entryTemplate = [];
    if (typeof request.body.desc !== 'undefined') {
      template.desc = request.body.desc;
    } else {
      template.desc = '';
    }
    {
      const templateWithSameName = await this.templateService.findByName(
        template.name,
      );
      if (templateWithSameName !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `Template with name '${template.name}' already exist.`,
        );
      }
    }
    const addTemplateResult = await this.templateService.add(template);
    if (addTemplateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to add Template to database.`,
      );
    }
    return {
      template,
    };
  }

  /** Updates a existing Template object. */
  @Put()
  async update(request: Request): Promise<{ template: Template }> {
    const error = HttpErrorFactory.simple('update', this.logger);
    const body = JSON.parse(JSON.stringify(request.body));
    try {
      ObjectUtility.compareWithSchema(
        body,
        {
          _id: {
            __type: 'string',
            __required: true,
          },
          name: {
            __type: 'string',
            __required: false,
          },
          desc: {
            __type: 'string',
            __required: false,
          },
          defaults: {
            __type: 'object',
            __required: false,
            __child: {
              title: {
                __type: 'string',
                __required: false,
              },
              coverImageUri: {
                __type: 'string',
                __required: false,
              },
            },
          },
          changes: {
            __type: 'object',
            __required: false,
            __child: {
              props: {
                __type: 'array',
                __required: true,
                __child: {
                  __type: 'object',
                  __content: PropUtil.changesSchema,
                },
              },
            },
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
        `Invalid ID '${request.body._d}' was provided.`,
      );
    }
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
    } else {
      const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const template = await this.templateService.findById(request.body._id);
    if (template === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Template with ID '${request.body._id}' does not exist.`,
      );
    }
    let changeDetected: boolean = false;
    if (
      typeof request.body.name !== 'undefined' &&
      request.body.name !== template.name
    ) {
      changeDetected = true;
      template.name = StringUtility.createSlug(request.body.name);
      const templateWithSameName = await this.templateService.findByName(
        template.name,
      );
      if (templateWithSameName !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `Template with name '${template.name}' already exist.`,
        );
      }
    }
    if (
      typeof request.body.desc !== 'undefined' &&
      request.body.desc !== template.desc
    ) {
      changeDetected = true;
      template.desc = request.body.desc;
    }
    if (typeof request.body.defaults !== 'undefined') {
      if (!template.defaults) {
        template.defaults = {
          title: '',
          coverImageUri: '',
        };
      }
      if (typeof request.body.defaults.title === 'string') {
        template.defaults.title = request.body.defaults.title;
      }
      if (typeof request.body.defaults.coverImageUri === 'string') {
        template.defaults.coverImageUri = request.body.defaults.coverImageUri;
      }
    }
    if (typeof request.body.entryTemplate !== 'undefined') {
      if (typeof request.body.changes === 'undefined') {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'When updating entryTemplate, changes must be provided.',
        );
      }
      changeDetected = true;
      try {
        template.entryTemplate = await PropUtil.getPropsFromUntrustedObject(
          request.body.entryTemplate,
          this.groupService,
        );
      } catch (e) {
        throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
      }
    }
    if (changeDetected === false) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Noting to update.');
    }
    const updateTemplateResult = await this.templateService.update(template);
    if (updateTemplateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update the Template in database.',
      );
    }
    if (typeof request.body.changes !== 'undefined') {
      const changes = { props: request.body.changes.props as PropChanges[] };
      if (changes.props.length > 0) {
        // const entries = await this.entryService.findAllById(template.entryIds);
        const entries = await CacheControl.Entry.findAllById(template.entryIds);
        for (const i in entries) {
          const entry = entries[i];
          entry.content.forEach((content) => {
            changes.props.forEach((change) => {
              if (change.remove === true) {
                content.props = content.props.filter(
                  (prop) => prop.name !== change.name.old,
                );
              } else {
                content.props.forEach((prop) => {
                  if (prop.name === change.name.old) {
                    prop.name = change.name.new;
                    prop.required = change.required;
                  }
                });
              }
            });
          });
          // const updateEntryResult = await this.entryService.update(entry);
          const updateEntryResult = await CacheControl.Entry.update(entry);
          if (updateEntryResult === false) {
            this.logger.error(
              'update',
              `Failed to update Entry '${entry._id.toHexString()}'.`,
            );
          }
        }
      }
    }
    return {
      template,
    };
  }

  /** Removes a specified Template object and its Entries. */
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
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.DELETE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const template = await this.templateService.findById(request.params.id);
    if (template === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Template with ID '${request.params.id}' does not exist.`,
      );
    }
    const deleteTemplateResult = await this.templateService.deleteById(
      request.params.id,
    );
    if (deleteTemplateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to delete Template from database.`,
      );
    }
    // await this.entryService.deleteAllById(template.entryIds);
    await CacheControl.Entry.deleteAllById(template.entryIds);
    return {
      message: 'Success.',
    };
  }
}
