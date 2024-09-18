import type { TypeGeneratorLanguage } from '@bcms/selfhosted-backend/type-generator/generator/main';

export interface Args {
    cmsOrigin?: string;
    deploy?: 'debian' | 'ubuntu';
    projectName?: string;
    pull?: 'types' | 'entries' | 'media';
    language?: TypeGeneratorLanguage;
    apiKey?: string;
    email?: string;
    password?: string;
    output?: string;
}

export interface ArgInfo {
    flags: string[];
    description?: string;
    values?: string[];
}

export const argsMap: {
    [key: string]: ArgInfo;
} = {
    cmsOrigin: {
        flags: ['--cms-origin', '--co'],
        description:
            'URL of the BCMS instance (ex. https://my-bcms-domain.com)',
    },
    deploy: {
        flags: ['--deploy'],
        description: 'Deploy BCMS on the server',
        values: ['debian', 'ubuntu'],
    },
    projectName: {
        flags: ['--project-name'],
        description: 'Project name when deploying a BCMS',
    },
    pull: {
        flags: ['--pull'],
        description: 'Pull data from the BCMS',
        values: ['types', 'entries', 'media'],
    },
    language: {
        flags: ['--language', '--lng'],
        description: 'Language to use for previous commands',
    },
    apiKey: {
        flags: ['--api-key'],
        description:
            'API key which will be used to create instance of BCMS Client. Option example: --api-key {KEY_ID}.{KEY_SECRET}',
    },
    email: {
        flags: ['--email'],
        description: 'User email',
    },
    password: {
        flags: ['--password'],
        description: 'User password',
    },
    output: {
        flags: ['--output'],
        description: 'Destination to which command output fill be saved',
    },
};

export function getArgs(): Args {
    const argv = process.argv.slice(2);
    const args: {
        [name: string]: string | boolean;
    } = {};
    let lastKey = '';
    while (argv.length > 0) {
        const arg = argv.splice(0, 1)[0];
        if (arg.startsWith('--')) {
            lastKey = arg;
            args[lastKey] = true;
        } else {
            args[lastKey] = arg;
        }
    }
    const output: any = {};
    for (const key in argsMap) {
        for (let i = 0; i < argsMap[key].flags.length; i++) {
            const flag = argsMap[key].flags[i];
            if (args[flag]) {
                const value = args[flag] + '';
                if (
                    argsMap[key].values &&
                    !argsMap[key].values.includes(value)
                ) {
                    throw Error(
                        `Flag "${flag}" is not allowed to have value "${value}". Allowed values: ${argsMap[key].values.join(', ')}`,
                    );
                }
                output[key] = args[flag];
            }
        }
    }
    return output;
}
