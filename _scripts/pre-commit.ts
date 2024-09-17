import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import { StringUtility } from '@bcms/selfhosted-utils/string-utility';
import path from 'path';

export async function preCommit() {
    const whatToCheck = {
        backend: false,
        ui: false,
        client: false,
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
        } else if (p.startsWith('client/')) {
            whatToCheck.ui = true;
        }
    }
    if (whatToCheck.backend) {
        await ChildProcess.advancedExec('npm run lint', {
            cwd: path.join(process.cwd(), 'backend'),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        }).awaiter;
        await ChildProcess.advancedExec('npm run build:noEmit', {
            cwd: path.join(process.cwd(), 'backend'),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        }).awaiter;
    }
    if (whatToCheck.ui) {
        await ChildProcess.advancedExec('npm run lint', {
            cwd: path.join(process.cwd(), 'ui'),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        }).awaiter;
        await ChildProcess.advancedExec('npm run type-check', {
            cwd: path.join(process.cwd(), 'ui'),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        }).awaiter;
    }
    if (whatToCheck.client) {
        await ChildProcess.advancedExec('npm run lint', {
            cwd: path.join(process.cwd(), 'client'),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        }).awaiter;
        await ChildProcess.advancedExec('npm run build:noEmit', {
            cwd: path.join(process.cwd(), 'client'),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        }).awaiter;
    }
}
