import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import path from 'path';
import { FS } from '@bcms/selfhosted-utils/fs';

export async function packUiComponents() {
    await ChildProcess.advancedExec('npm pack', {
        cwd: path.join(process.cwd(), 'ui', 'dist-components'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}

export async function buildUiComponents() {
    const basePath = path.join(process.cwd(), 'ui');
    const localFs = new FS(basePath);
    const dist = 'dist-components';
    if (await localFs.exist(dist)) {
        await localFs.deleteDir(dist);
    }
    const toCopy = [
        'components',
        'data',
        'directives',
        'hooks',
        'layouts',
        'services',
        'styles',
        'util',
        'webgl',
        'store.ts',
        'window.ts',
    ];
    for (let i = 0; i < toCopy.length; i++) {
        await localFs.copy(['src', toCopy[i]], [dist, 'src', toCopy[i]]);
    }
    await localFs.copy('tailwind.config.cjs', [dist, 'tailwind.config.cjs']);
    await localFs.copy('package.json', [dist, 'package.json']);
}

export async function buildUi() {
    await ChildProcess.advancedExec('npm run build', {
        cwd: path.join(process.cwd(), 'ui'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}
