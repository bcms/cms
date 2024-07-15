import path from 'path';
import mime from 'mime-types';
import { createMiddleware } from '@thebcms/selfhosted-backend/server';
import { FS } from '@thebcms/selfhosted-utils/fs';

export const UIProxy = createMiddleware({
    name: 'UIProxy',
    handler() {
        const fs = new FS(path.join(process.cwd(), '..', 'ui', 'dist'));
        return async (req, res, next) => {
            const url = req.url + '';
            if (url.startsWith('/api')) {
                next();
                return;
            }
            const urlParts = url
                .split('?')[0]
                .split('/')
                .filter((e) => e && e !== '..');
            if (await fs.exist(urlParts, true)) {
                res.setHeader(
                    'Content-Type',
                    mime.contentType(urlParts[urlParts.length - 1]) + '',
                );
                res.statusCode = 200;
                const file = await fs.read(urlParts);
                res.setHeader('Content-Length', file.length);
                res.write(file);
                res.end();
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.statusCode = 200;
            res.write(await fs.read('index.html'));
            res.end();
        };
    },
});
