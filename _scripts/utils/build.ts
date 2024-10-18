import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import { FS } from '@bcms/selfhosted-utils/fs';

export async function buildMjs(
    fs: FS,
    basePath: string,
    cmd: string,
    dist: string,
    afterBuild?: () => Promise<void>,
) {
    await ChildProcess.advancedExec(`npm run ${cmd}`, {
        cwd: basePath,
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
    if (afterBuild) {
        await afterBuild();
    }
    const files = await fs.fileTree([dist, 'mjs'], '');
    for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        if (fileInfo.path.rel.endsWith('.d.ts')) {
            const rPath = fileInfo.path.rel.split('/');
            await fs.move([dist, 'mjs', ...rPath], [dist, ...rPath]);
        } else if (fileInfo.path.rel.endsWith('.js')) {
            await fs.move(
                [dist, 'mjs', ...fileInfo.path.rel.split('/')],
                [dist, ...fileInfo.path.rel.replace('.js', '.mjs').split('/')],
            );
        }
    }
    await fs.deleteDir([dist, 'mjs']);
}

export async function buildCjs(
    fs: FS,
    basePath: string,
    cmd: string,
    dist: string,
    afterBuild?: () => Promise<void>,
) {
    await ChildProcess.advancedExec(`npm run ${cmd}`, {
        cwd: basePath,
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
    if (afterBuild) {
        await afterBuild();
    }
    const files = await fs.fileTree([dist, 'cjs'], '');
    for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        if (fileInfo.path.rel.endsWith('.js')) {
            await fs.move(
                [dist, 'cjs', ...fileInfo.path.rel.split('/')],
                [dist, ...fileInfo.path.rel.replace('.js', '.cjs').split('/')],
            );
        }
    }
    await fs.deleteDir([dist, 'cjs']);
}
