export interface Args {
    deploy?: 'debian' | 'ubuntu';
    projectName?: string;
}

export interface ArgInfo {
    flags: string[];
    description?: string;
    values?: string[];
}

export const argsMap: {
    [key: string]: ArgInfo;
} = {
    deploy: {
        flags: ['--deploy'],
        description: 'Deploy BCMS on the server',
        values: ['debian', 'ubuntu'],
    },
    projectName: {
        flags: ['--project-name'],
        description: 'Project name when deploying a BCMS',
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
