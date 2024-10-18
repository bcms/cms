import path from 'path';
import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import { FS } from '@bcms/selfhosted-utils/fs';
import { buildCjs, buildMjs } from './utils/build';
import { packageJsonExport } from './utils/package-json';
import {
    getBackendVersion,
    getClientVersion,
    getSdkVersion,
    getUtilsVersion,
} from './utils/versions';

export async function packCli() {
    await ChildProcess.advancedExec('npm pack', {
        cwd: path.join(process.cwd(), 'cli', 'dist'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}

export async function buildCli() {
    const basePath = path.join(process.cwd(), 'cli');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist'])) {
        await localFs.deleteDir(['dist']);
    }
    await buildMjs(localFs, basePath, 'build:ts:mjs', 'dist', async () => {
        const delDirs = ['backend', 'client', 'ui'];
        for (let i = 0; i < delDirs.length; i++) {
            const delDir = delDirs[i];
            await localFs.deleteDir(['dist', 'mjs', delDir]);
        }
        const files = await localFs.fileTree(['dist', 'mjs', 'cli', 'src'], '');
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            await localFs.move(
                ['dist', 'mjs', 'cli', 'src', fileInfo.path.rel],
                ['dist', 'mjs', fileInfo.path.rel],
            );
        }
    });
    await buildCjs(localFs, basePath, 'build:ts:cjs', 'dist', async () => {
        const delDirs = ['backend', 'client', 'ui'];
        for (let i = 0; i < delDirs.length; i++) {
            const delDir = delDirs[i];
            await localFs.deleteDir(['dist', 'cjs', delDir]);
        }
        const files = await localFs.fileTree(['dist', 'cjs', 'cli', 'src'], '');
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            await localFs.move(
                ['dist', 'cjs', 'cli', 'src', fileInfo.path.rel],
                ['dist', 'cjs', fileInfo.path.rel],
            );
        }
    });
    await localFs.copy('LICENSE', ['dist', 'LICENSE']);
    const packageJson = JSON.parse(await localFs.readString('package.json'));
    packageJson.devDependencies = undefined;
    packageJson.scripts = {};
    const backendVersion = await getBackendVersion();
    const utilsVersion = await getUtilsVersion();
    const sdkVersion = await getSdkVersion();
    const clientVersion = await getClientVersion();
    packageJson.dependencies[backendVersion[0]] = '^' + backendVersion[1];
    packageJson.dependencies[utilsVersion[0]] = '^' + utilsVersion[1];
    packageJson.dependencies[sdkVersion[0]] = '^' + sdkVersion[1];
    packageJson.dependencies[clientVersion[0]] = '^' + clientVersion[1];
    let files = await localFs.fileTree(['dist'], '');
    packageJsonExport(files, packageJson);
    await localFs.save(
        ['dist', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}
