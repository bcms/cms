import * as swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';
import { Request, Response, RequestHandler } from 'express';
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
} from 'purple-cheetah';

@Controller('/docs/swagger')
export class SwaggerController {
  @AppLogger(SwaggerController)
  private logger: Logger;
  private swaggerHandler: RequestHandler;

  @Get()
  async swagger(request: Request, response: Response) {
    const error = HttpErrorFactory.simple('.swagger', this.logger);
    const jwt = JWTEncoding.decode(request.headers.authorization);
    if (jwt instanceof Error) {
      throw error.occurred(HttpStatus.BAD_REQUEST, jwt.message);
    } else {
      const jwtError = JWTSecurity.validateAndCheckTokenPermissions(
        jwt,
        [RoleName.SUDO, RoleName.USER],
        PermissionName.READ,
        JWTConfigService.get('user-token-config'),
      );
      if (jwtError instanceof Error) {
        throw error.occurred(HttpStatus.FORBIDDEN, jwtError.message);
      }
    }
    if (!this.swaggerHandler) {
      this.swaggerHandler = swaggerUi.setup(
        YAML.load(__dirname + '/../../assets/swagger.yaml'),
        {
          customCss: '.swagger-ui .topbar { display: none }',
        },
      );
    }
    this.swaggerHandler(request, response, () => {
      return;
    });
  }
}
