import {
  Controller,
  AppLogger,
  Logger,
  Service,
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
import { GroupService } from './group.service';
import { Group } from './models/group.modal';
import { Request } from 'express';
import { GroupFactory } from './factories/group.factory';
import { PropUtil } from '../prop/prop-util';
import { GroupUtil } from './group-util';
import { TemplateService } from '../template/template.service';
import { PropType, PropGroupPointer } from '../prop/interfaces/prop.interface';
import { WidgetService } from '../widget/widget.service';

@Controller('/group')
export class GroupController {
  @AppLogger(GroupController)
  private logger: Logger;
  @Service(GroupService)
  private groupService: GroupService;
  @Service(TemplateService)
  private templateService: TemplateService;
  @Service(WidgetService)
  private widgetService: WidgetService;

  @Get('/all')
  async getAll(request: Request): Promise<{ groups: Group[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    let ids: string[] = [];
    if (request.query.ids) {
      ids = request.query.ids.split('-');
      ids.forEach((id, i) => {
        if (StringUtility.isIdValid(id) === false) {
          throw error.occurred(
            HttpStatus.FORBIDDEN,
            `Invalid ID '${id}' was provided at [${i}].`,
          );
        }
      });
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
    let groups: Group[];
    if (ids.length > 0) {
      groups = await this.groupService.findAllById(ids);
    } else {
      groups = await this.groupService.findAll();
    }
    return {
      groups,
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ group: Group }> {
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
    const group = await this.groupService.findById(request.params.id);
    if (group === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Group with ID '${request.params.id}' does not exist.`,
      );
    }
    return {
      group,
    };
  }

  @Post()
  async add(request: Request): Promise<{ group: Group }> {
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
    const group = GroupFactory.instance;
    group.name = GroupUtil.nameEncode(request.body.name);
    if (typeof request.body.desc !== 'undefined') {
      group.desc = request.body.desc;
    } else {
      group.desc = '';
    }
    const groupWithSameName = await this.groupService.findByName(group.name);
    if (groupWithSameName !== null) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Group with name '${group.name}' already exist.`,
      );
    }
    const addGroupResult = await this.groupService.add(group);
    if (addGroupResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Group to database.',
      );
    }
    return {
      group,
    };
  }

  @Put()
  async update(request: Request): Promise<{ group: Group }> {
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
            __required: false,
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
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const group = await this.groupService.findById(request.body._id);
    if (group === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Group with ID '${request.body._id}' does not exist.`,
      );
    }
    let changeDetected: boolean = false;
    if (
      typeof request.body.name !== 'undefined' &&
      request.body.name !== group.name
    ) {
      changeDetected = true;
      group.name = GroupUtil.nameEncode(request.body.name);
      const groupWithSameName = await this.groupService.findByName(group.name);
      if (groupWithSameName !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `Group with name '${group.name}' already exist.`,
        );
      }
    }
    if (
      typeof request.body.desc !== 'undefined' &&
      request.body.desc !== group.desc
    ) {
      changeDetected = true;
      group.desc = request.body.desc;
    }
    if (typeof request.body.props !== 'undefined') {
      changeDetected = true;
      try {
        group.props = await PropUtil.getPropsFromUntrustedObject(
          request.body.props,
          this.groupService,
        );
      } catch (e) {
        throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
      }
    }
    if (changeDetected === false) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Noting to update.');
    }
    const updateGroupResult = await this.groupService.update(group);
    if (updateGroupResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update Group in database.`,
      );
    }
    const groups = await this.groupService.findAll();
    for (const i in groups) {
      const g = groups[i];
      const updateGroupPointerResult = GroupUtil.updateGroupPointer(
        g.props,
        group,
      );
      if (updateGroupPointerResult.changes === true) {
        g.props = updateGroupPointerResult.props;
        const updateResult = await this.groupService.update(g);
        if (updateResult === false) {
          this.logger.error(
            'update',
            `Failed to update Group Pointer in Group ` +
              `'${g._id}' with pointer '${group._id}'.`,
          );
        }
      }
    }
    const templates = await this.templateService.findAll();
    for (const i in templates) {
      const template = templates[i];
      const updateGroupPointerResult = GroupUtil.updateGroupPointer(
        template.entryTemplate,
        group,
      );
      if (updateGroupPointerResult.changes === true) {
        template.entryTemplate = updateGroupPointerResult.props;
        const updateResult = await this.templateService.update(template);
        if (updateResult === false) {
          this.logger.error(
            'update',
            `Failed to update Group Pointer in Template ` +
              `'${template._id}' with pointer '${group._id}'.`,
          );
        }
      }
    }
    const widgets = await this.widgetService.findAll();
    for (const i in widgets) {
      const widget = widgets[i];
      const updateGroupPointerResult = GroupUtil.updateGroupPointer(
        widget.props,
        group,
      );
      if (updateGroupPointerResult.changes === true) {
        widget.props = updateGroupPointerResult.props;
        const updateResult = await this.widgetService.update(widget);
        if (updateResult === false) {
          this.logger.error(
            'update',
            `Failed to update Group Pointer in Widget ` +
              `'${widget._id}' with pointer '${group._id}'.`,
          );
        }
      }
    }
    return {
      group,
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
        [RoleName.ADMIN, RoleName.USER],
        PermissionName.WRITE,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtValid instanceof Error) {
        throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
      }
    }
    const group = await this.groupService.findById(request.params.id);
    if (group === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Group with ID '${request.params.id}' does not exist`,
      );
    }
    const deleteGroupResult = await this.groupService.deleteById(
      request.params.id,
    );
    if (deleteGroupResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to remove Group from database.`,
      );
    }
    this.logger.info('delete', 'H1');
    const groups = await this.groupService.findAll();
    for (const i in groups) {
      const oldLng = groups[i].props.length;
      groups[i].props = groups[i].props.filter(prop => {
        if (prop.type === PropType.GROUP_POINTER) {
          const value = prop.value as PropGroupPointer;
          if (value._id === group._id.toHexString()) {
            return false;
          }
        }
        return true;
      });
      if (oldLng !== groups[i].props.length) {
        const updateResult = await this.groupService.update(groups[i]);
        if (updateResult === false) {
          this.logger.error(
            'update',
            `Failed to update Group Pointer in Group ` +
              `'${groups[i]._id}' with pointer '${group._id}'.`,
          );
        }
      }
    }
    this.logger.info('delete', 'H2');
    const templates = await this.templateService.findAll();
    for (const i in templates) {
      const oldLng = templates[i].entryTemplate.length;
      templates[i].entryTemplate = templates[i].entryTemplate.filter(prop => {
        if (prop.type === PropType.GROUP_POINTER) {
          if (
            (prop.value as PropGroupPointer)._id === group._id.toHexString()
          ) {
            return false;
          }
        }
        return true;
      });
      if (oldLng !== templates[i].entryTemplate.length) {
        this.logger.info('delete', 'Update template');
        const updateResult = await this.templateService.update(templates[i]);
        if (updateResult === false) {
          this.logger.error(
            'update',
            `Failed to update Group Pointer in Template ` +
              `'${templates[i]._id}' with pointer '${group._id}'.`,
          );
        }
      }
    }
    this.logger.info('delete', 'H3');
    const widgets = await this.widgetService.findAll();
    for (const i in widgets) {
      const oldLng = widgets[i].props.length;
      widgets[i].props = widgets[i].props.filter(prop => {
        if (prop.type === PropType.GROUP_POINTER) {
          if (
            (prop.value as PropGroupPointer)._id === group._id.toHexString()
          ) {
            return false;
          }
        }
        return true;
      });
      if (oldLng !== widgets[i].props.length) {
        const updateResult = await this.widgetService.update(widgets[i]);
        if (updateResult === false) {
          this.logger.error(
            'update',
            `Failed to update Group Pointer in Widget ` +
              `'${widgets[i]._id}' with pointer '${group._id}'.`,
          );
        }
      }
    }
    return {
      message: 'Success.',
    };
  }
}
