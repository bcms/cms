import { FS } from '@thebcms/selfhosted-utils/fs';
import path from 'path';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';

export async function buildBackend() {
    const fs = new FS(path.join(process.cwd(), 'backend'));
    if (await fs.exist('dist')) {
        await fs.deleteDir('dist');
    }
    await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
    });
}
