import {
    spawn,
    exec,
    type SpawnOptions,
    type ExecOptions,
} from 'child_process';

export interface ChildProcessExecOutput {
    stop(): void;
    awaiter: Promise<void>;
}

export type ChildProcessExecChunkType = 'stdout' | 'stderr';

export interface ChildProcessOnChunkHelperOutput {
    out: string;
    err: string;
}

export interface ChildProcessOnChunk {
    (type: ChildProcessExecChunkType, chunk: string): void;
}

export class ChildProcess {
    static async spawn(
        cmd: string,
        args: string[],
        options?: SpawnOptions,
    ): Promise<void> {
        return await new Promise<void>((resolve, reject) => {
            const proc = spawn(
                cmd,
                args,
                options
                    ? options
                    : {
                          stdio: 'inherit',
                      },
            );
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(
                        Error(
                            `Failed to spawn "${cmd} ${args.join(
                                ' ',
                            )}" with status code ${code}`,
                        ),
                    );
                    reject('Child process failed with code ' + code);
                }
            });
        });
    }
    static async exec(
        cmd: string,
        onChunk?: ChildProcessOnChunk,
    ): Promise<void> {
        return await new Promise<void>((resolve, reject) => {
            const proc = exec(cmd);
            let err = '';
            if (proc.stderr) {
                proc.stderr.on('data', (chunk) => {
                    if (onChunk) {
                        onChunk('stderr', chunk);
                    }
                    err += chunk;
                });
            }
            if (proc.stdout && onChunk) {
                proc.stdout.on('data', (chunk) => {
                    onChunk('stdout', chunk);
                });
            }
            proc.on('close', (code) => {
                if (code !== 0) {
                    reject(
                        Error(
                            `Failed to execute "${cmd}" with status code ${code}. \n\n ${err}`,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
    }
    static advancedExec(
        cmd: string | string[],
        options?: ExecOptions & {
            onChunk?: ChildProcessOnChunk;
            doNotThrowError?: boolean;
        },
    ): ChildProcessExecOutput {
        const output: ChildProcessExecOutput = {
            stop: undefined as never,
            awaiter: undefined as never,
        };
        output.awaiter = new Promise<void>((resolve, reject) => {
            const proc = exec(
                cmd instanceof Array ? cmd.join(' ') : cmd,
                options,
            );
            output.stop = () => {
                const result = proc.kill();
                if (result) {
                    resolve();
                } else {
                    reject(Error('Failed to kill process'));
                }
            };
            if (options && options.onChunk) {
                const onChunk = options.onChunk;
                if (proc.stderr) {
                    proc.stderr.on('data', (chunk) => {
                        onChunk('stderr', chunk);
                    });
                }
                if (proc.stdout) {
                    proc.stdout.on('data', (chunk) => {
                        onChunk('stdout', chunk);
                    });
                }
            }
            proc.on('close', (code) => {
                if (options && options.doNotThrowError) {
                    resolve();
                } else if (code !== 0) {
                    reject(
                        Error(
                            `Failed to execute "${cmd}" with status code ${code}`,
                        ),
                    );
                } else {
                    resolve();
                }
            });
        });
        return output;
    }
    static onChunkHelper(
        output: ChildProcessOnChunkHelperOutput,
    ): (type: ChildProcessExecChunkType, chunk: string) => void {
        output.out = '';
        output.err = '';
        return (type, chunk) => {
            if (type === 'stdout') {
                output.out += chunk;
            } else {
                output.err += chunk;
            }
        };
    }
}
