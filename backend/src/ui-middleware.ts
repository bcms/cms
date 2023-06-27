import * as path from 'path';
import {
  createMiddleware,
  StringUtility,
  useFS,
} from '@becomes/purple-cheetah';
import type { NextFunction, Request, Response } from 'express';
import { useBcmsPluginManager } from './plugin';

export const BCMSUiAssetMiddleware = createMiddleware({
  name: 'UI assets middleware',
  after: false,
  path: '/',
  handler() {
    const pluginManager = useBcmsPluginManager();
    const fs = useFS();
    return async (req: Request, res: Response, next: NextFunction) => {
      if (req.originalUrl.startsWith('/api')) {
        next();
      } else {
        let filePath = '';
        if (req.originalUrl.startsWith('/plugin')) {
          const pathParams = req.originalUrl
            .substring(1)
            .split('?')[0]
            .split('/')
            .map((e) => e.replace(/\.\./g, ''));
          const pluginInfo = pluginManager
            .getListInfo()
            .find((e) => StringUtility.toSlug(e.name) === pathParams[1]);
          if (pluginInfo) {
            filePath = path.join(
              pluginInfo.dirPath,
              'ui',
              ...pathParams.slice(2),
            );
          }
        } else {
          filePath = path.join(
            process.cwd(),
            'public',
            ...req.originalUrl.substring(1).replace(/\.\./g, '').split('/'),
          );
        }
        if (await fs.exist(filePath, true)) {
          res.sendFile(filePath);
        } else {
          res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
        }
      }
    };
  },
});
