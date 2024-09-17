import path from 'path';
import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import { FS } from '@bcms/selfhosted-utils/fs';

export async function buildTypes() {
    const rootFs = new FS(process.cwd());
    if (await rootFs.exist(['backend', 'types'])) {
        await rootFs.deleteDir(['backend', 'types']);
    }
    if (await rootFs.exist(['backend', 'dist'])) {
        await rootFs.deleteDir(['backend', 'dist']);
    }
    await ChildProcess.advancedExec('npm run build', {
        cwd: path.join(process.cwd(), 'backend'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
    const fileTree = await rootFs.fileTree(['backend', 'dist'], '');
    for (let i = 0; i < fileTree.length; i++) {
        const fileInfo = fileTree[i];
        if (fileInfo.path.rel.endsWith('.d.ts')) {
            await rootFs.copy(
                ['backend', 'dist', fileInfo.path.rel],
                ['backend', 'types', fileInfo.path.rel],
            );
        }
    }
}
