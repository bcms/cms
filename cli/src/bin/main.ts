#!/usr/bin/env node

import { getArgs } from '@bcms/selfhosted-cli/args';
import { Cli } from '@bcms/selfhosted-cli';
import { type Config, ConfigSchema } from '@bcms/selfhosted-cli/config';
import os from 'os';
import { Client, type ClientApiKey } from '@bcms/selfhosted-client';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@bcms/selfhosted-utils/object-utility';

async function main() {
    const args = getArgs();

    let config: Config | null = null;
    const tryConfigFiles = [
        'bcms.config.js',
        'bcms.config.cjs',
        'bcms.config.mjs',
    ];
    for (let i = 0; i < tryConfigFiles.length; i++) {
        const configPath =
            os.platform() === 'win32'
                ? `${process.cwd().replace(/\\/g, '/').split(':')[1]}/${tryConfigFiles[i]}`
                : `${process.cwd()}/${tryConfigFiles[i]}`;
        try {
            config = ((await import(configPath)) as any).default;
            break;
        } catch (err) {
            // Ignore
        }
    }
    let client: Client | undefined = undefined;
    if (config) {
        const checkConfig = ObjectUtility.compareWithSchema(
            config,
            ConfigSchema,
            'bcms-config',
        );
        if (checkConfig instanceof ObjectUtilityError) {
            throw Error(checkConfig.message);
        }
        const cmsOrigin = config.cmsOrigin || args.cmsOrigin;
        let apiKey: ClientApiKey | undefined = undefined;
        if (args.apiKey) {
            const [id, secret] = args.apiKey.split('.');
            apiKey = { id, secret };
        } else if (config.client) {
            apiKey = config.client.apiKey;
        }
        if (cmsOrigin && apiKey) {
            client = new Client(cmsOrigin, apiKey, {
                useMemCache: true,
                injectSvg: true,
                enableSocket: true,
            });
        }
    }

    const cli = new Cli(args, config || {}, client);

    if (args.deploy) {
        if (args.deploy === 'debian' || args.deploy === 'ubuntu') {
            await cli.deploy.debian();
            return;
        }
    } else if (args.pull) {
        if (args.pull === 'types') {
            await cli.pull.types();
            return;
        }
    } else if (args.help) {
        cli.help();
        return;
    }
    console.warn('Unknown combination of arguments');
    cli.help();
}
main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
