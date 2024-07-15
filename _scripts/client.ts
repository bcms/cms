import path from 'path';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import { FS } from '@thebcms/selfhosted-utils/fs';

export async function packClient() {
    await ChildProcess.spawn('npm', ['pack'], {
        cwd: path.join(process.cwd(), 'client', 'dist'),
        stdio: 'inherit',
    });
}

export async function buildClient() {
    const basePath = path.join(process.cwd(), 'client');
    const localFs = new FS(basePath);

    if (await localFs.exist(['dist'])) {
        await localFs.deleteDir(['dist']);
    }

    async function buildMjs() {
        await ChildProcess.spawn('npm', ['run', 'build:ts:mjs'], {
            cwd: basePath,
            stdio: 'inherit',
        });
        const files = await localFs.fileTree(['dist', 'mjs'], '');
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            if (fileInfo.path.rel.endsWith('.d.ts')) {
                const rPath = fileInfo.path.rel.split('/');
                await localFs.move(
                    ['dist', 'mjs', ...rPath],
                    ['dist', ...rPath],
                );
            } else if (fileInfo.path.rel.endsWith('.js')) {
                await localFs.move(
                    ['dist', 'mjs', ...fileInfo.path.rel.split('/')],
                    [
                        'dist',
                        ...fileInfo.path.rel.replace('.js', '.mjs').split('/'),
                    ],
                );
            }
        }
        await localFs.deleteDir(['dist', 'mjs']);
    }

    async function buildCjs() {
        await ChildProcess.spawn('npm', ['run', 'build:ts:cjs'], {
            cwd: basePath,
            stdio: 'inherit',
        });
        const files = await localFs.fileTree(['dist', 'cjs'], '');
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            if (fileInfo.path.rel.endsWith('.js')) {
                await localFs.move(
                    ['dist', 'cjs', ...fileInfo.path.rel.split('/')],
                    [
                        'dist',
                        ...fileInfo.path.rel.replace('.js', '.cjs').split('/'),
                    ],
                );
            }
        }
        await localFs.deleteDir(['dist', 'cjs']);
    }

    await buildMjs();
    await buildCjs();
    const fileNames = await localFs.readdir(['dist', 'client', 'src']);
    for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        await localFs.move(
            ['dist', 'client', 'src', fileName],
            ['dist', fileName],
        );
    }
    await localFs.deleteDir(['dist', 'backend']);
    await localFs.deleteDir(['dist', 'client']);
    await localFs.copy('README.md', ['dist', 'README.md']);
    await localFs.copy('LICENSE', ['dist', 'LICENSE']);
    const packageJson = JSON.parse(await localFs.readString('package.json'));
    packageJson.devDependencies = undefined;
    packageJson.scripts = {};

    let files = await localFs.fileTree(['dist'], '');
    for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        if (
            fileInfo.path.rel !== 'index.cjs' &&
            fileInfo.path.rel !== 'index.mjs' &&
            (fileInfo.path.rel.endsWith('.cjs') ||
                fileInfo.path.rel.endsWith('.mjs'))
        ) {
            const exportName =
                './' +
                fileInfo.path.rel
                    .replace('/index.cjs', '')
                    .replace('/index.mjs', '')
                    .replace('.mjs', '')
                    .replace('.cjs', '');
            if (!packageJson.exports[exportName]) {
                packageJson.exports[exportName] = {};
            }
            if (fileInfo.path.rel.endsWith('.mjs')) {
                packageJson.exports[exportName].import =
                    './' + fileInfo.path.rel;
            }
            if (fileInfo.path.rel.endsWith('.cjs')) {
                packageJson.exports[exportName].require =
                    './' + fileInfo.path.rel;
            }
        }
    }
    await localFs.save(
        ['dist', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}
