import {
  Controller,
  AppLogger,
  Logger,
  Service,
  Get,
  HttpErrorFactory,
  StringUtility,
  HttpStatus,
  JWTEncoding,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  Post,
  ObjectUtility,
  Put,
  Delete,
} from 'purple-cheetah';
import { GroupService } from '../group/group.service';
import { WidgetService } from './widget.service';
import { Request } from 'express';
import { Widget } from './models/widget.model';
import { WidgetFactory } from './factories/widget.factory';
import { WidgetUtil } from './widget-util';
import { PropUtil } from '../prop/prop-util';
import { EntryService } from '../entry';
import { PropChanges } from '../prop/interfaces/prop-changes.interface';

@Controller('/widget')
export class WidgetController {
  @AppLogger(WidgetController)
  private logger: Logger;
  @Service(GroupService)
  private groupService: GroupService;
  @Service(WidgetService)
  private widgetService: WidgetService;
  @Service(EntryService)
  private entryService: EntryService;

  @Get('/all')
  async getAll(request: Request): Promise<{ widgets: Widget[] }> {
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
    let widgets: Widget[];
    if (ids.length > 0) {
      widgets = await this.widgetService.findAllById(ids);
    } else {
      widgets = await this.widgetService.findAll();
    }
    return {
      widgets,
    };
  }

  @Get('/:id')
  async getById(request: Request): Promise<{ widget: Widget }> {
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
    const widget = await this.widgetService.findById(request.params.id);
    if (widget === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Widget with ID '${request.params.id}' does not exist.`,
      );
    }
    return {
      widget,
    };
  }

  @Post()
  async add(request: Request): Promise<{ widget: Widget }> {
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
    const widget = WidgetFactory.instance;
    widget.name = WidgetUtil.nameEncode(request.body.name);
    if (typeof request.body.desc !== 'undefined') {
      widget.desc = request.body.desc;
    } else {
      widget.desc = '';
    }
    const widgetWithSameName = await this.widgetService.findByName(widget.name);
    if (widgetWithSameName !== null) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Widget with name '${widget.name}' already exist.`,
      );
    }
    const addWidgetResult = await this.widgetService.add(widget);
    if (addWidgetResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Widget to database.',
      );
    }
    return {
      widget,
    };
  }

  @Put()
  async update(request: Request): Promise<{ widget: Widget }> {
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
    const widget = await this.widgetService.findById(request.body._id);
    if (widget === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Widget with ID '${request.body._id}' does not exist.`,
      );
    }
    let changeDetected: boolean = false;
    let updateName: boolean = false;
    let oldWidgetName: string = '';
    if (
      typeof request.body.name !== 'undefined' &&
      request.body.name !== widget.name
    ) {
      changeDetected = true;
      updateName = true;
      oldWidgetName = `${widget.name}`;
      widget.name = WidgetUtil.nameEncode(request.body.name);
      const widgetWithSameName = await this.widgetService.findByName(
        widget.name,
      );
      if (widgetWithSameName !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `Widget with name '${widget.name}' already exist.`,
        );
      }
    }
    if (
      typeof request.body.desc !== 'undefined' &&
      request.body.desc !== widget.desc
    ) {
      changeDetected = true;
      widget.desc = request.body.desc;
    }
    if (typeof request.body.props !== 'undefined') {
      if (typeof request.body.changes === 'undefined') {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'When updating Props, changes must be provided.',
        );
      }
      changeDetected = true;
      try {
        widget.props = await PropUtil.getPropsFromUntrustedObject(
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
    const updateWidgetResult = await this.widgetService.update(widget);
    if (updateWidgetResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to update Widget in database.`,
      );
    }
    if (updateName === true || typeof request.body.changes !== 'undefined') {
      const changes = request.body.changes.props as PropChanges[];
      let addDetected: boolean = false;
      for (const i in changes) {
        const change = changes[i];
        if (change.add) {
          addDetected = true;
          await WidgetUtil.addNewPropsToWidgetInEntries(
            this.entryService,
            this.logger,
            change,
            request.body._id,
          );
        }
      }
      if (addDetected === false) {
        await WidgetUtil.updateEntriesWithNewWidgetData(
          this.entryService,
          this.logger,
          updateName === true ? oldWidgetName : widget.name,
          updateName === true ? widget.name : undefined,
          request.body.changes.props,
        );
      }
    }
    return {
      widget,
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
    const widget = await this.widgetService.findById(request.params.id);
    if (widget === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Widget with ID '${request.params.id}' does not exist.`,
      );
    }
    const deleteWidgetResult = await this.widgetService.deleteById(
      request.params.id,
    );
    if (deleteWidgetResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to remove Widget from database.`,
      );
    }
    return {
      message: 'Success.',
    };
  }
}
