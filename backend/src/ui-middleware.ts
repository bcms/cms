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
    const ipRequests: {
      [ip: string]: {
        count: number;
        blocked: boolean;
        rmAt: number;
      };
    } = {};
    setInterval(() => {
      const toRemove: string[] = [];
      for (const ip in ipRequests) {
        const data = ipRequests[ip];
        if (data.rmAt < Date.now()) {
          toRemove.push(ip);
        }
      }
      for (let i = 0; i < toRemove.length; i++) {
        const ip = toRemove[i];
        delete ipRequests[ip];
      }
    }, 10000);

    function markIp(ip: string) {
      if (ip !== 'undefined') {
        if (!ipRequests[ip]) {
          ipRequests[ip] = {
            blocked: false,
            count: 0,
            rmAt: Date.now() + 60000,
          };
        }
        ipRequests[ip].count++;
        ipRequests[ip].rmAt = Date.now() + 60000;
        if (ipRequests[ip].count > 5) {
          ipRequests[ip].blocked = true;
        }
      }
    }

    return async (req: Request, res: Response, next: NextFunction) => {
      const ip = '' + req.headers['x-forwarded-for'];
      if (ipRequests[ip] && ipRequests[ip].blocked) {
        res.status(429);
        res.json({ message: 'To many failed requests' });
        res.end();
        console.log('Blocked IP', ip);
        return;
      }
      if (req.originalUrl.startsWith('/api')) {
        next();
      } else {
        if (req.originalUrl.length > 255) {
          markIp(ip);
          res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
          return;
        }
        let filePath = '';
        const pathParts = req.originalUrl.split('/');
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          if (
            (part.includes('.') && i < pathParts.length - 1) ||
            part.length > 255
          ) {
            markIp(ip);
            res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
            return;
          }
        }
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
          // if (req.originalUrl !== '/') {
          //   markIp(ip);
          // }
          res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
        }
      }
    };
  },
});
