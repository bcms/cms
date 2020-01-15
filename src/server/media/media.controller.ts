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
  Service,
  StringUtility,
  Post,
  Delete,
} from 'purple-cheetah';
import { Request, Response } from 'express';
import * as path from 'path';
import { Media, MediaType } from './models/media.model';
import { MediaService } from './media.service';
import { MediaAggregate } from './interfaces/media-aggregate.interface';
import { MediaFactory } from './factories/media.factory';
import { FSUtil } from './fs-util';
import { MediaUtil } from './media-util';
import { GitUtil } from './git-util';
import { APISecurity } from '../api';

@Controller('/media')
export class MediaController {
  @AppLogger(MediaController)
  private logger: Logger;
  @Service(MediaService)
  private mediaService: MediaService;

  private static aggregate(
    rootMedia: Media,
    childMedia: Media[],
  ): MediaAggregate {
    const mediaAggregate: MediaAggregate = {
      _id: rootMedia._id.toHexString(),
      createdAt: rootMedia.createdAt,
      updatedAt: rootMedia.updatedAt,
      userId: rootMedia.userId,
      isInRoot: rootMedia.isInRoot,
      name: rootMedia.name,
      path: rootMedia.path,
      type: rootMedia.type,
      mimetype: rootMedia.mimetype,
      size: rootMedia.size,
      state: false,
    };
    if (rootMedia.childrenIds) {
      if (rootMedia.childrenIds.length > 0) {
        rootMedia.childrenIds.forEach(cid => {
          const cm = childMedia.find(e => e._id.toHexString() === cid);
          if (cm) {
            if (!mediaAggregate.children) {
              mediaAggregate.children = [];
            }
            if (cm.childrenIds) {
              const cma = MediaController.aggregate(cm, childMedia);
              mediaAggregate.children.push(cma);
            } else {
              mediaAggregate.children.push({
                _id: cm._id.toHexString(),
                createdAt: cm.createdAt,
                updatedAt: cm.updatedAt,
                userId: cm.userId,
                isInRoot: cm.isInRoot,
                name: cm.name,
                path: cm.path,
                type: cm.type,
                mimetype: cm.mimetype,
                size: cm.size,
                state: false,
              });
            }
          }
        });
      } else {
        mediaAggregate.children = [];
      }
    }
    return mediaAggregate;
  }

  private static async deleteRecursive(
    ids: string[],
    service: MediaService,
    logger: Logger,
  ) {
    const media: Media[] = await service.findAllById(ids);
    for (const i in media) {
      const m = media[i];
      if (m.childrenIds && m.childrenIds.length > 0) {
        await MediaController.deleteRecursive(m.childrenIds, service, logger);
      }
      const deleteResult = await service.deleteById(m._id.toHexString());
      if (deleteResult === false) {
        logger.error(
          'deleteRecursive',
          `Failed to delete '${m._id.toHexString()}'.`,
        );
      }
    }
  }

  @Get('/all')
  async getAll(request: Request): Promise<{ media: Media[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
          true,
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
    let media: Media[];
    if (request.query.ids) {
      const ids: string[] = request.query.ids.split('-');
      ids.forEach((id, i) => {
        if (StringUtility.isIdValid(id) === false) {
          throw error.occurred(
            HttpStatus.FORBIDDEN,
            `Invalid ID '${id}' was provided at position '${i}'.`,
          );
        }
      });
      media = await this.mediaService.findAllById(ids);
    } else {
      media = await this.mediaService.findAll();
    }
    return {
      media,
    };
  }

  @Get('/all/aggregate')
  async getAllAggregate(
    request: Request,
  ): Promise<{ media: MediaAggregate[] }> {
    const error = HttpErrorFactory.simple('getAllAggregate', this.logger);
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
          true,
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
    const rootMedia: Media[] = await this.mediaService.findByIsInRoot(true);
    const childMedia: Media[] = await this.mediaService.findByIsInRoot(false);
    const mediaAggregate: MediaAggregate[] = [];
    rootMedia.forEach(media => {
      mediaAggregate.push(MediaController.aggregate(media, childMedia));
    });
    return {
      media: mediaAggregate,
    };
  }

  @Get('/file')
  async getFile(request: Request, response: Response) {
    const error = HttpErrorFactory.simple('getFile', this.logger);
    if (!request.query.path) {
      throw error.occurred(HttpStatus.BAD_REQUEST, `Missing query 'path'.`);
    }
    if (!request.query.access_token) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        `Missing query 'access_token'.`,
      );
    }
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
          request.body,
          request.method.toUpperCase(),
          request.originalUrl,
          true,
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
    const p = request.query.path.replace(/\.\./g, '').replace(/\/\//g, '/');
    const exist = await FSUtil.exist(p);
    if (exist === false) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `File at path '${p}' does not exist.`,
      );
    }
    response.sendFile(path.join(process.env.PROJECT_ROOT, '/uploads', p));
    return;
  }

  @Get('/exist')
  async exist(request: Request): Promise<{ exist: boolean }> {
    const error = HttpErrorFactory.simple('exist', this.logger);
    if (!request.query.path) {
      throw error.occurred(HttpStatus.BAD_REQUEST, `Missing query 'path'.`);
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
    const p = request.query.path.replace(/\.\./g, '').replace(/\/\//g, '/');
    const exist = await FSUtil.exist(p);
    return {
      exist,
    };
  }

  @Post('/file')
  async addFile(request: Request): Promise<{ media: Media }> {
    const error = HttpErrorFactory.simple('addFile', this.logger);
    if (request.headers.upload_file_error_message) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        request.headers.upload_file_error_message,
      );
    }
    if (!request.file) {
      throw error.occurred(HttpStatus.FORBIDDEN, 'Missing file in request.');
    }
    if (!request.query.path) {
      throw error.occurred(HttpStatus.BAD_REQUEST, `Missing query 'path'.`);
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
    const media: Media = MediaFactory.instance;
    media.userId = jwt.payload.userId;
    media.type = MediaUtil.mimetypeToMediaType(request.file.mimetype);
    media.mimetype = request.file.mimetype;
    media.size = request.file.size;
    media.name = request.file.originalname;
    media.path = request.query.path.replace(/\.\./g, '').replace(/\/\//g, '/');
    const pathParts = media.path.split('/');
    media.isInRoot = pathParts[1] !== '' ? false : true;
    media.childrenIds = undefined;
    if (pathParts.length > 2 && media.path.endsWith('/')) {
      media.path = media.path.substring(0, media.path.length - 1);
    }
    const parentDirExist = await FSUtil.exist(
      pathParts.slice(0, pathParts.length - 1).join('/'),
    );
    if (parentDirExist === false) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Parent directory '${pathParts
          .slice(0, pathParts.length - 1)
          .join('/')}' does not exist.`,
      );
    }
    let parentMedia: Media;
    if (media.isInRoot === false) {
      parentMedia = await this.mediaService.findByPath(media.path);
      if (parentMedia === null) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Cannot find parent directory '${pathParts
            .slice(0, pathParts.length - 1)
            .join('/')}'.`,
        );
      }
    }
    {
      const fileWithSameName = await this.mediaService.findByNameAndPath(
        media.name,
        media.path,
      );
      if (fileWithSameName !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `File with name '${media.name}' already exist at path '${media.path}'`,
        );
      }
    }
    try {
      await FSUtil.save(request.file.buffer, `${media.path}/${media.name}`);
    } catch (e) {
      this.logger.error('addFile', e);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to save the file.',
      );
    }
    const addFileResult = await this.mediaService.add(media);
    if (addFileResult === false) {
      await FSUtil.deleteFile(media.path);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add file to database.',
      );
    }
    if (parentMedia) {
      parentMedia.childrenIds.push(media._id.toHexString());
      await this.mediaService.update(parentMedia);
    } else {
      this.logger.warn('addFile', 'No Parent');
    }
    GitUtil.updateUploads(media);
    return {
      media,
    };
  }

  @Post('/folder')
  async addFolder(request: Request): Promise<{ media: Media }> {
    const error = HttpErrorFactory.simple('addFolder', this.logger);
    if (!request.query.path) {
      throw error.occurred(HttpStatus.BAD_REQUEST, `Missing query 'path'.`);
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
    const media: Media = MediaFactory.instance;
    media.userId = jwt.payload.userId;
    media.type = MediaType.DIR;
    media.mimetype = 'dir';
    media.size = 0;
    media.path = request.query.path.replace(/\.\./g, '').replace(/\/\//g, '/');
    const pathParts = media.path.split('/');
    media.name = pathParts[pathParts.length - 1];
    media.isInRoot = pathParts.length > 2 ? false : true;
    media.childrenIds = [];
    if (media.path.endsWith('/')) {
      media.path = media.path.substring(0, media.path.length - 1);
    }
    let parentMedia: Media;
    if (media.isInRoot === false) {
      const parentDirExist = await FSUtil.exist(
        pathParts.slice(0, pathParts.length - 1).join('/'),
      );
      if (parentDirExist === false) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          `Parent directory '${pathParts
            .slice(0, pathParts.length - 1)
            .join('/')}' does not exist.`,
        );
      }
      parentMedia = await this.mediaService.findByPath(
        pathParts.slice(0, pathParts.length - 1).join('/'),
      );
      if (parentMedia === null) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Cannot find parent directory '${pathParts
            .slice(0, pathParts.length - 1)
            .join('/')}'.`,
        );
      }
    }
    try {
      await FSUtil.save('', path.join(media.path, '/temp.txt'));
    } catch (e) {
      this.logger.error('addFolder', e);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        `Failed to create directory.`,
      );
    }
    await FSUtil.deleteFile(path.join(media.path, '/temp.txt'));
    const addMediaResult = await this.mediaService.add(media);
    if (addMediaResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add directory pointer to database.',
      );
    }
    if (parentMedia) {
      parentMedia.childrenIds.push(media._id.toHexString());
      await this.mediaService.update(parentMedia);
    }
    return {
      media,
    };
  }

  /*
  @Put('/file/rename')
  async rename(request: Request): Promise<{ media: Media }> {
    const error = HttpErrorFactory.simple('rename', this.logger);
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
    const media = await this.mediaService.findById(request.body._id);
    if (media === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Media with ID '${request.body._id}' does not exist.`,
      );
    }
    {

    }
  }
  */

  @Delete('/folder/:id')
  async deleteFolder(request: Request): Promise<{ message: string }> {
    const error = HttpErrorFactory.simple('deleteFolder', this.logger);
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
    const rootMedia = await this.mediaService.findById(request.params.id);
    if (rootMedia === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Directory with ID '${request.params.id}' does not exist.`,
      );
    }
    if (rootMedia.childrenIds && rootMedia.childrenIds.length > 0) {
      await MediaController.deleteRecursive(
        rootMedia.childrenIds,
        this.mediaService,
        this.logger,
      );
    }
    const deleteRootMediaResult = await this.mediaService.deleteById(
      rootMedia._id.toHexString(),
    );
    if (deleteRootMediaResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove directory pointer from database.',
      );
    }
    this.logger.info('deleteFolder', `${rootMedia.path}`);
    try {
      await FSUtil.deleteDir(path.join(rootMedia.path));
    } catch (e) {
      this.logger.error(
        'deleteFolder',
        `Failed to delete '${rootMedia.path}' directory from FS.`,
      );
    }
    GitUtil.updateUploads(rootMedia);
    return {
      message: 'Success.',
    };
  }

  @Delete('/file/:id')
  async deleteFile(request: Request): Promise<{ message: string }> {
    const error = HttpErrorFactory.simple('deleteFile', this.logger);
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
    const rootMedia = await this.mediaService.findById(request.params.id);
    if (rootMedia === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `File with ID '${request.params.id}' does not exist.`,
      );
    }
    if (rootMedia.type === MediaType.DIR) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Media with ID '${rootMedia._id.toHexString()}' is a directory.`,
      );
    }
    const deleteRootMediaResult = await this.mediaService.deleteById(
      rootMedia._id.toHexString(),
    );
    if (deleteRootMediaResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove file pointer from database.',
      );
    }
    try {
      await FSUtil.deleteFile(path.join(rootMedia.path, rootMedia.name));
    } catch (e) {
      this.logger.error(
        'deleteFile',
        `Failed to delete '${rootMedia.path}/${rootMedia.name}' file from FS.`,
      );
    }
    GitUtil.updateUploads(rootMedia);
    return {
      message: 'Success.',
    };
  }

  // @Get('/folder-tree')
  // async getFolderTree(request: Request): Promise<{ folderTree: FolderTree[] }> {
  //   const error = HttpErrorFactory.simple('getFolderTree', this.logger);
  //   const jwt = JWTEncoding.decode(request.headers.authorization);
  //   if (jwt instanceof Error) {
  //     throw error.occurred(HttpStatus.UNAUTHORIZED, jwt.message);
  //   } else {
  //     const jwtValid = JWTSecurity.validateAndCheckTokenPermissions(
  //       jwt,
  //       [RoleName.ADMIN, RoleName.USER],
  //       PermissionName.READ,
  //       JWTConfigService.get('user-token-config'),
  //     );
  //     if (jwtValid instanceof Error) {
  //       throw error.occurred(HttpStatus.UNAUTHORIZED, jwtValid.message);
  //     }
  //   }
  //   const folderTree = await FSUtil.folderTree(
  //     path.join(__dirname, '../../uploads'),
  //   );
  //   return {
  //     folderTree,
  //   };
  // }
}
