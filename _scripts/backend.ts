import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import path from 'path';
import { FS } from '@bcms/selfhosted-utils/fs';
import { packageJsonExport } from './utils/package-json';
import { replaceStringInFile } from './utils/file';
import { buildCjs, buildMjs } from './utils/build';
import { getUtilsVersion } from './utils/versions';

export async function buildUtils() {
    const basePath = path.join(process.cwd(), 'backend');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist-utils'])) {
        await localFs.deleteDir(['dist-utils']);
    }
    await buildMjs(localFs, basePath, 'build:utils:mjs', 'dist-utils');
    await buildCjs(localFs, basePath, 'build:utils:cjs', 'dist-utils');
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
    await ChildProcess.advancedExec('npm pack', {
        cwd: path.join(process.cwd(), 'backend', 'dist-utils'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}

export async function buildBackend() {
    const basePath = path.join(process.cwd(), 'backend');
    const localFs = new FS(basePath);
    if (await localFs.exist(['dist'])) {
        await localFs.deleteDir(['dist']);
    }
    await ChildProcess.advancedExec('npm run build', {
        cwd: basePath,
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
    // await replaceStringInFile({
    //     endsWith: ['.js', '.d.ts'],
    //     basePath: '/_utils',
    //     dirPath: ['backend', 'dist'],
    //     regex: [/@bcms\/selfhosted-utils/g],
    // });
    await replaceStringInFile({
        endsWith: ['.js', '.d.ts'],
        basePath: '',
        dirPath: ['backend', 'dist'],
        regex: [/@bcms\/selfhosted-backend/g],
    });
    const packageJson = JSON.parse(await localFs.readString('package.json'));
    const utilsVersion = await getUtilsVersion();
    packageJson.dependencies[utilsVersion[0]] = '^' + utilsVersion[1];
    packageJson.devDependencies = undefined;
    packageJson.scripts = undefined;
    packageJson.nodemonConfig = undefined;
    await localFs.save(
        ['dist', 'package.json'],
        JSON.stringify(packageJson, null, 4),
    );
}

export async function packBackend() {
    await ChildProcess.advancedExec('npm pack', {
        cwd: path.join(process.cwd(), 'backend', 'dist'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}
