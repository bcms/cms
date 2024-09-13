import path from 'path';
import mime from 'mime-types';
import { createMiddleware } from '@thebcms/selfhosted-backend/server';
import { FS } from '@thebcms/selfhosted-utils/fs';

export const UIProxy = createMiddleware({
    name: 'UIProxy',
    handler() {
        const fs = new FS(path.join(process.cwd(), '..', 'ui', 'dist'));
        const pluginFs = new FS(path.join(process.cwd(), 'plugins'));
        return async (req, res, next) => {
            const url = req.url + '';
            if (url.startsWith('/api')) {
                next();
                return;
            } else if (url.startsWith('/__plugin')) {
                let urlParts = url
                    .split('?')[0]
                    .split('/')
                    .filter((e) => e && e !== '..')
                    .slice(1);
                console.log({ urlParts });
                urlParts = [urlParts[0], '_ui', ...urlParts.slice(1)];
                if (await pluginFs.exist(urlParts, true)) {
                    res.setHeader(
                        'Content-Type',
                        mime.contentType(urlParts[urlParts.length - 1]) + '',
                    );
                    res.statusCode = 200;
                    const file = await pluginFs.read(urlParts);
                    res.setHeader('Content-Length', file.length);
                    res.write(file);
                    res.end();
                    return;
                }
                res.setHeader('Content-Type', 'text/html');
                res.statusCode = 200;
                res.write(
                    await pluginFs.read([urlParts[0], '_ui', 'index.html']),
                );
                res.end();
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
