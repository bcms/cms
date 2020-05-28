import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
} from '@becomes/purple-cheetah';
import { Router, Request, Response } from 'express';
import * as YAML from 'yamljs';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import * as swaggerUi from 'swagger-ui-express';

@Controller('/api/swagger')
export class SwaggerController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  private swaggerHandler: any;

  @Get()
  async get(request: Request, response: Response) {
    if (!this.swaggerHandler) {
      const file = await (
        await util.promisify(fs.readFile)(path.join(__dirname, 'doc.yaml'))
      )
        .toString()
        .replace('@PORT', process.env.PORT);
      this.swaggerHandler = swaggerUi.setup(YAML.parse(file), {
        customCss: '.swagger-ui .topbar { display: none }',
      });
    }
    this.swaggerHandler(request, response, () => {
      return;
    });
  }
}
