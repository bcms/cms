import { ChildProcess } from '@bcms/selfhosted-utils/child-process';
import path from 'path';

export async function publish(basePath: string[]) {
    await ChildProcess.advancedExec(
        'npm publish',
        {
            cwd: path.join(process.cwd(), ...basePath),
            onChunk(type, chunk) {
                process[type].write(chunk);
            },
        },
    ).awaiter;
}
