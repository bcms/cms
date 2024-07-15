import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import path from 'path';

export async function postinstall() {
    await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
    });
    await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'ui'),
        stdio: 'inherit',
    });
}
