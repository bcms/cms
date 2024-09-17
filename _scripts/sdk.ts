import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import path from 'path';
import { FS } from '@bcms/selfhosted-utils/fs';
import { buildCjs, buildMjs } from './utils/build';
import { getBackendVersion, getUtilsVersion } from './utils/versions';
import { packageJsonExport } from './utils/package-json';

export async function packSdk() {
    await ChildProcess.advancedExec('npm pack', {
        cwd: path.join(process.cwd(), 'ui', 'dist-sdk'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}

export async function buildSdk() {
    const basePath = path.join(process.cwd(), 'ui');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist-sdk'])) {
        await localFs.deleteDir(['dist-sdk']);
    }
    await buildMjs(localFs, basePath, 'build:sdk:mjs', 'dist-sdk', async () => {
        const delDirs = ['backend'];
        for (let i = 0; i < delDirs.length; i++) {
            const delDir = delDirs[i];
            await localFs.deleteDir(['dist-sdk', 'mjs', delDir]);
        }
        const files = await localFs.fileTree(
            ['dist-sdk', 'mjs', 'ui', 'src', 'sdk'],
            '',
        );
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            await localFs.move(
                ['dist-sdk', 'mjs', 'ui', 'src', 'sdk', fileInfo.path.rel],
                ['dist-sdk', 'mjs', fileInfo.path.rel],
            );
        }
    });
    await buildCjs(localFs, basePath, 'build:sdk:cjs', 'dist-sdk', async () => {
        const delDirs = ['backend'];
        for (let i = 0; i < delDirs.length; i++) {
            const delDir = delDirs[i];
            await localFs.deleteDir(['dist-sdk', 'cjs', delDir]);
        }
        const files = await localFs.fileTree(
            ['dist-sdk', 'cjs', 'ui', 'src', 'sdk'],
            '',
        );
        for (let i = 0; i < files.length; i++) {
            const fileInfo = files[i];
            await localFs.move(
                ['dist-sdk', 'cjs', 'ui', 'src', 'sdk', fileInfo.path.rel],
                ['dist-sdk', 'cjs', fileInfo.path.rel],
            );
        }
    });
    await localFs.copy('SDK-README.md', ['dist-sdk', 'README.md']);
    await localFs.copy(['..', 'LICENSE'], ['dist-sdk', 'LICENSE']);
    const packageJson = JSON.parse(
        await localFs.readString('sdk.package.json'),
    );
    packageJson.devDependencies = undefined;
    packageJson.scripts = {};
    const backendVersion = await getBackendVersion();
    const utilsVersion = await getUtilsVersion();
    packageJson.dependencies[backendVersion[0]] = '^' + backendVersion[1];
    packageJson.dependencies[utilsVersion[0]] = '^' + utilsVersion[1];
    let files = await localFs.fileTree(['dist-sdk'], '');
    packageJsonExport(files, packageJson);
    await localFs.save(
        ['dist-sdk', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}
