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
    const basePath = path.join(process.cwd(), 'client');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist'])) {
        await localFs.deleteDir(['dist']);
    }
    await buildMjs(localFs, basePath, 'build:ts:mjs', 'dist');
    await buildCjs(localFs, basePath, 'build:ts:cjs', 'dist');
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
    const backendVersion = await getBackendVersion();
    const utilsVersion = await getUtilsVersion();
    packageJson.dependencies[backendVersion[0]] = '^' + backendVersion[1];
    packageJson.dependencies[utilsVersion[0]] = '^' + utilsVersion[1];
    let files = await localFs.fileTree(['dist'], '');
    packageJsonExport(files, packageJson);
    await localFs.save(
        ['dist', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}
