import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import path from 'path';

export async function postinstall() {
    await ChildProcess.advancedExec('npm i', {
        cwd: path.join(process.cwd(), 'backend'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
    await ChildProcess.advancedExec('npm i', {
        cwd: path.join(process.cwd(), 'ui'),
        onChunk(type, chunk) {
            process[type].write(chunk);
        },
    }).awaiter;
}
