import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import path from 'path';
import { FS } from '@thebcms/selfhosted-utils/fs';
import { packageJsonExport } from './utils/package-json';
import { replaceStringInFile } from './utils/file';

export async function buildUtils() {
    const basePath = path.join(process.cwd(), 'backend');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist-utils'])) {
        await localFs.deleteDir(['dist-utils']);
    }

    async function buildMjs() {
        await ChildProcess.spawn('npm', ['run', 'build:utils:mjs'], {
            cwd: basePath,
            stdio: 'inherit',
        });
        const files = await localFs.fileTree(['dist-utils', 'mjs'], '');
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            if (fileInfo.path.rel.endsWith('.d.ts')) {
                const rPath = fileInfo.path.rel.split('/');
                await localFs.move(
                    ['dist-utils', 'mjs', ...rPath],
                    ['dist-utils', ...rPath],
                );
            } else if (fileInfo.path.rel.endsWith('.js')) {
                await localFs.move(
                    ['dist-utils', 'mjs', ...fileInfo.path.rel.split('/')],
                    [
                        'dist-utils',
                        ...fileInfo.path.rel.replace('.js', '.mjs').split('/'),
                    ],
                );
            }
        }
        await localFs.deleteDir(['dist-utils', 'mjs']);
    }

    async function buildCjs() {
        await ChildProcess.spawn('npm', ['run', 'build:utils:cjs'], {
            cwd: basePath,
            stdio: 'inherit',
        });
        const files = await localFs.fileTree(['dist-utils', 'cjs'], '');
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            if (fileInfo.path.rel.endsWith('.js')) {
                await localFs.move(
                    ['dist-utils', 'cjs', ...fileInfo.path.rel.split('/')],
                    [
                        'dist-utils',
                        ...fileInfo.path.rel.replace('.js', '.cjs').split('/'),
                    ],
                );
            }
        }
        await localFs.deleteDir(['dist-utils', 'cjs']);
    }

    await buildMjs();
    await buildCjs();
    const packageJson = JSON.parse(
        await localFs.readString('utils.package.json'),
    );
    packageJson.devDependencies = undefined;
    packageJson.scripts = undefined;
    let files = await localFs.fileTree(['dist-utils'], '');
    packageJsonExport(files, packageJson);
    await localFs.save(
        ['dist-utils', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}

export async function packUtils() {
    await ChildProcess.spawn('npm', ['pack'], {
        cwd: path.join(process.cwd(), 'backend', 'dist-utils'),
        stdio: 'inherit',
    });
}

export async function buildBackend() {
    const basePath = path.join(process.cwd(), 'backend');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist'])) {
        await localFs.deleteDir(['dist']);
    }
    await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: basePath,
        stdio: 'inherit',
    });
    await replaceStringInFile({
        endsWith: ['.js', '.d.ts'],
        basePath: '/_utils',
        dirPath: ['backend', 'dist'],
        regex: [/@thebcms\/selfhosted-utils/g],
    });
    await replaceStringInFile({
        endsWith: ['.js', '.d.ts'],
        basePath: '/_server',
        dirPath: ['backend', 'dist'],
        regex: [/@thebcms\/selfhosted-backend\/server/g],
    });
    await replaceStringInFile({
        endsWith: ['.js', '.d.ts'],
        basePath: '',
        dirPath: ['backend', 'dist'],
        regex: [/@thebcms\/selfhosted-backend/g],
    });
    const packageJson = JSON.parse(await localFs.readString('package.json'));
    packageJson.devDependencies = undefined;
    packageJson.scripts = undefined;
    packageJson.nodemonConfig = undefined;
    await localFs.save(
        ['dist', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}

export async function packBackend() {
    await ChildProcess.spawn('npm', ['pack'], {
        cwd: path.join(process.cwd(), 'backend', 'dist'),
        stdio: 'inherit',
    });
}
