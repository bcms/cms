import {
  Controller,
  AppLogger,
  Logger,
  Service,
  Get,
  HttpErrorFactory,
  HttpStatus,
  JWTEncoding,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  StringUtility,
  Post,
  Delete,
} from 'purple-cheetah';
import { LanguageService } from './language.service';
import { Request } from 'express';
import { APISecurity } from '../api/api-security';
import { ISOLanguages, ISOLanguage } from './iso-languages-list';
import { Language } from './models/language.model';
import { LanguageFactory } from './factories/language.factory';
import { EntryService } from '../entry/entry.service';

@Controller('/language')
export class LanguageController {
  @AppLogger(LanguageController)
  private logger: Logger;
  @Service(LanguageService)
  private languageService: LanguageService;
  @Service(EntryService)
  private entryService: EntryService;

  @Get('/all/available')
  async getAllAvailable(
    request: Request,
  ): Promise<{
    isoLanguages: ISOLanguage[];
  }> {
    const error = HttpErrorFactory.simple('getAllAvailable', this.logger);
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
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
    return { isoLanguages: ISOLanguages.getAll };
  }

  @Get('/all')
  async getAll(request: Request): Promise<{ languages: Language[] }> {
    const error = HttpErrorFactory.simple('getAll', this.logger);
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
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
    const languages = await this.languageService.findAll();
    return {
      languages,
    };
  }

  @Get('/:idOrCode')
  async getByIdOrName(request: Request): Promise<{ language: Language }> {
    const error = HttpErrorFactory.simple('getByIdOrName', this.logger);
    if (request.query.signature) {
      try {
        APISecurity.verify(
          request.query,
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
    let language: Language;
    if (StringUtility.isIdValid(request.params.idOrCode) === true) {
      language = await this.languageService.findById(request.params.idOrCode);
    } else {
      language = await this.languageService.findByCode(request.params.idOrCode);
    }
    if (!language) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Language with ID or code '${request.params.idOrCode}' does not exist.`,
      );
    }
    return {
      language,
    };
  }

  @Post('/:code')
  async add(request: Request): Promise<{ language: Language }> {
    const error = HttpErrorFactory.simple('add', this.logger);
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
    const languageWithSameCode = await this.languageService.findByCode(
      request.params.code,
    );
    if (languageWithSameCode !== null) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        `Language with Code '${request.params.code}' is already added.`,
      );
    }
    const isoLanguage = ISOLanguages.get(request.params.code);
    if (isoLanguage === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Language with Code '${request.params.code}' is not available.`,
      );
    }
    const language = LanguageFactory.instance;
    language.userId = jwt.payload.userId;
    language.code = isoLanguage.code;
    language.name = isoLanguage.name;
    language.nativeName = isoLanguage.nativeName;
    const addLanguageResult = await this.languageService.add(language);
    if (addLanguageResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to add Language to database.',
      );
    }
    return {
      language,
    };
  }

  @Delete('/:idOrCode')
  async deleteByIdOrCode(request: Request): Promise<{ message: string }> {
    const error = HttpErrorFactory.simple('add', this.logger);
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
    let language: Language;
    if (StringUtility.isIdValid(request.params.idOrCode) === true) {
      language = await this.languageService.findById(request.params.idOrCode);
    } else {
      language = await this.languageService.findByCode(request.params.idOrCode);
    }
    if (language === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Language with ID or Code '${request.params.idOrCode}' does not exist.`,
      );
    }
    const deleteLanguageResult = await this.languageService.deleteById(
      language._id.toHexString(),
    );
    if (deleteLanguageResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove language from database.',
      );
    }

    return {
      message: 'Success.',
    };
  }
}
