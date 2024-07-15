import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import { StringUtility } from '@thebcms/selfhosted-utils/string-utility';
import path from 'path';

export async function preCommit() {
    const whatToCheck = {
        backend: false,
        ui: false,
    };
    let gitOutput = '';
    await ChildProcess.advancedExec('git status', {
        cwd: process.cwd(),
        doNotThrowError: true,
        onChunk(type, chunk) {
            gitOutput += chunk;
            process[type].write(chunk);
        },
    }).awaiter;
    const paths = StringUtility.allTextBetween(gitOutput, '   ', '\n');
    for (let i = 0; i < paths.length; i++) {
        const p = paths[i];
        if (p.startsWith('backend/')) {
            whatToCheck.backend = true;
        } else if (p.startsWith('ui/')) {
            whatToCheck.ui = true;
        }
    }
    if (whatToCheck.backend) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'build:noEmit'], {
            cwd: path.join(process.cwd(), 'backend'),
            stdio: 'inherit',
        });
    }
    if (whatToCheck.ui) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
            cwd: path.join(process.cwd(), 'ui'),
            stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'type-check'], {
            cwd: path.join(process.cwd(), 'ui'),
            stdio: 'inherit',
        });
    }
}
