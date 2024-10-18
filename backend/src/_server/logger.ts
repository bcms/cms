import * as path from 'path';
import * as nodeFs from 'fs/promises';
import type { Module } from '@bcms/selfhosted-backend/_server/module';
import { FS } from '@bcms/selfhosted-utils/fs';
import { StringUtility } from '@bcms/selfhosted-utils/string-utility';

type Write = (
    str: Uint8Array | string,
    encoding?: BufferEncoding,
    cb?: (err?: Error) => void,
) => boolean;

export interface LoggerOnMessage {
    (event: {
        data: string | Buffer | Uint8Array;
        type: 'stdout' | 'stderr';
    }): void;
}

export interface LoggerConfig {
    onMessage?: LoggerOnMessage;
    silent?: boolean;
    silentLogger?: boolean;
    doNotOverrideProcess?: boolean;
    onlyStderrToConsole?: boolean;
    saveToFile?: {
        output: string;
        interval: number;
    };
}

export interface Logger {
    info(place: string, message: unknown): void;
    warn(place: string, message: unknown): void;
    error(place: string, message: unknown): void;
}

export class ConsoleColors {
    // TEXT
    static Reset = '\x1b[0m';
    static Bright = '\x1b[1m';
    static Dim = '\x1b[2m';
    static Underscore = '\x1b[4m';
    static Blink = '\x1b[5m';
    static Reverse = '\x1b[7m';
    static Hidden = '\x1b[8m';
    // FG
    static FgBlack = '\x1b[30m';
    static FgRed = '\x1b[31m';
    static FgGreen = '\x1b[32m';
    static FgYellow = '\x1b[33m';
    static FgBlue = '\x1b[34m';
    static FgMagenta = '\x1b[35m';
    static FgCyan = '\x1b[36m';
    static FgWhite = '\x1b[37m';
    // BG
    static BgBlack = '\x1b[40m';
    static BgRed = '\x1b[41m';
    static BgGreen = '\x1b[42m';
    static BgYellow = '\x1b[43m';
    static BgBlue = '\x1b[44m';
    static BgMagenta = '\x1b[45m';
    static BgCyan = '\x1b[46m';
    static BgWhite = '\x1b[47m';
}

let loggerConfig: LoggerConfig | undefined;

export function createLogger(config?: LoggerConfig): Module {
    loggerConfig = config;
    return {
        name: 'Logger',
        initialize({ next }) {
            const outputBuffer: string[] = [];
            const outputPath =
                config && config.saveToFile
                    ? `${
                          config.saveToFile.output.startsWith('/')
                              ? config.saveToFile.output
                              : path.join(
                                    process.cwd(),
                                    ...config.saveToFile.output.split('/'),
                                )
                      }`
                    : path.join(process.cwd(), 'logs');
            const fs = new FS(outputPath);

            if (config && config.saveToFile) {
                setInterval(() => {
                    save().catch((err) => {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    });
                }, config.saveToFile.interval);
            }

            async function save() {
                if (config && config.saveToFile) {
                    const dateObj = new Date();
                    const date = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}.log`;
                    if (!(await fs.exist(date, true))) {
                        await fs.save(date, '');
                    }
                    const outputDate = outputBuffer.splice(
                        0,
                        outputBuffer.length,
                    );
                    if (outputDate.length > 0) {
                        await nodeFs.appendFile(
                            path.join(outputPath, date),
                            outputDate.join(''),
                        );
                    }
                }
            }

            function createOutWrapper(
                write: Write,
                type: 'stdout' | 'stderr',
            ): Write {
                return (str, encoding, cb) => {
                    if (!config || !config.silent) {
                        const stack = (Error().stack as string).split('\n');
                        let location = '';
                        for (let i = 0; i < stack.length; i++) {
                            const item = stack[i];
                            if (
                                item.includes(`console.log`) ||
                                item.includes(`console.warn`) ||
                                item.includes(`console.error`)
                            ) {
                                i++;
                                while (i < stack.length) {
                                    if (
                                        !stack[i].includes('/logger')
                                        // !stack[i].includes('/node_modules')
                                    ) {
                                        location = StringUtility.textBetween(
                                            stack[i].replace(process.cwd(), ''),
                                            '(',
                                            ')',
                                        );
                                        break;
                                    }
                                    i++;
                                }
                                break;
                            }
                        }
                        const output = [
                            `[${
                                ConsoleColors.FgCyan
                            }${new Date().toLocaleString()}${
                                ConsoleColors.Reset
                            }]`,
                            location,
                            str,
                        ].join(' ');
                        str =
                            config && config.doNotOverrideProcess
                                ? str
                                : output;
                        outputBuffer.push(output);
                        if (config) {
                            if (
                                type !== 'stdout' ||
                                !config.onlyStderrToConsole
                            ) {
                                write.apply(process[type], [str, encoding, cb]);
                            }
                            if (config.onMessage) {
                                config.onMessage({ data: str, type });
                            }
                        }
                    }
                    return true;
                };
            }
            (process.stdout.write as Write) = createOutWrapper(
                process.stdout.write,
                'stdout',
            );
            (process.stderr.write as Write) = createOutWrapper(
                process.stderr.write,
                'stderr',
            );

            async function init() {
                if (config && config.saveToFile) {
                    if (!(await fs.exist(''))) {
                        await fs.save('temp.log', 'temp');
                        await fs.deleteFile('temp.log');
                    }
                }
            }

            init()
                .then(() => {
                    next();
                })
                .catch((err) => {
                    next(err);
                });
        },
    };
}

function circularReplacer() {
    const cache: unknown[] = [];
    return (_key: string, value: unknown) => {
        if (typeof value === 'object' && value !== null) {
            // Duplicate reference found, discard key
            if (cache.includes(value)) return;

            // Store value in our collection
            cache.push(value);
        }
        return value;
    };
}

function toOutput(messageParts: string, type: 'log' | 'warn' | 'error') {
    if (!loggerConfig || !loggerConfig.silentLogger) {
        // eslint-disable-next-line no-console
        console[type](messageParts);
    }
}

export class Logger {
    public name = 'Logger';
    constructor(name: string) {
        this.name = name;
        this.infoMsg = [
            `${ConsoleColors.FgWhite}[INFO]${ConsoleColors.Reset}`,
            `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.name}${ConsoleColors.Reset}`,
            `${ConsoleColors.FgMagenta}@place${ConsoleColors.Reset}`,
            '>',
            '@print',
        ].join(' ');
        this.warnMsg = [
            `${ConsoleColors.FgYellow}[WARN]${ConsoleColors.Reset}`,
            `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.name}${ConsoleColors.Reset}`,
            `${ConsoleColors.FgMagenta}@place${ConsoleColors.Reset}`,
            '>',
            '@print',
        ].join(' ');
        this.errMsg = [
            `${ConsoleColors.BgRed}[ERROR]${ConsoleColors.Reset}`,
            `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.name}${ConsoleColors.Reset}`,
            `${ConsoleColors.FgMagenta}@place${ConsoleColors.Reset}`,
            '>',
            '@print',
        ].join(' ');
    }

    private infoMsg = [
        `${ConsoleColors.FgWhite}[INFO]${ConsoleColors.Reset}`,
        `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.name}${ConsoleColors.Reset}`,
        `${ConsoleColors.FgMagenta}@place${ConsoleColors.Reset}`,
        '>',
        '@print',
    ].join(' ');
    private warnMsg = [
        `${ConsoleColors.FgYellow}[WARN]${ConsoleColors.Reset}`,
        `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.name}${ConsoleColors.Reset}`,
        `${ConsoleColors.FgMagenta}@place${ConsoleColors.Reset}`,
        '>',
        '@print',
    ].join(' ');
    private errMsg = [
        `${ConsoleColors.BgRed}[ERROR]${ConsoleColors.Reset}`,
        `${ConsoleColors.Bright}${ConsoleColors.FgMagenta}${this.name}${ConsoleColors.Reset}`,
        `${ConsoleColors.FgMagenta}@place${ConsoleColors.Reset}`,
        '>',
        '@print',
    ].join(' ');

    info(place: string, message: unknown) {
        let print = '';
        if (typeof message === 'object') {
            if (message instanceof Error) {
                print = `\r\n${ConsoleColors.FgYellow}${
                    message.stack
                        ? message.stack
                        : `${message.name}: ${message.message}`
                }${ConsoleColors.Reset}`;
            } else {
                print = `\r\n${ConsoleColors.FgWhite}${JSON.stringify(
                    message,
                    circularReplacer(),
                    2,
                )}${ConsoleColors.Reset}`;
            }
        } else {
            print = message as string;
        }
        toOutput(
            this.infoMsg.replace('@place', place).replace('@print', print),
            'log',
        );
    }

    warn(place: string, message: unknown) {
        let print = '';
        if (typeof message === 'object') {
            if (message instanceof Error) {
                print = `\r\n${ConsoleColors.FgYellow}${
                    message.stack
                        ? message.stack
                        : `${message.name}: ${message.message}`
                }${ConsoleColors.Reset}`;
            } else {
                print = `\r\n${ConsoleColors.FgYellow}${JSON.stringify(
                    message,
                    circularReplacer(),
                    2,
                )}${ConsoleColors.Reset}`;
            }
        } else {
            print = message as string;
        }
        toOutput(
            this.warnMsg.replace('@place', place).replace('@print', print),
            'warn',
        );
    }

    error(place: string, message: unknown) {
        let print = '';
        if (typeof message === 'object') {
            if (message instanceof Error) {
                print = `\r\n${ConsoleColors.FgYellow}${
                    message.stack
                        ? message.stack
                        : `${message.name}: ${message.message}`
                }${ConsoleColors.Reset}`;
            } else {
                print = `\r\n${ConsoleColors.FgRed}${JSON.stringify(
                    message,
                    circularReplacer(),
                    '  ',
                )}${ConsoleColors.Reset}`;
            }
        } else {
            print = message as string;
        }
        toOutput(
            this.errMsg.replace('@place', place).replace('@print', print),
            'error',
        );
    }
}

export function useLogger(config: { name: string }) {
    return new Logger(config.name);
}
