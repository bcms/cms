import { type Args, argsMap } from '@bcms/selfhosted-cli/args';
import { DeployHandler } from '@bcms/selfhosted-cli/handlers/deploy';
import type { Sdk } from '@bcms/selfhosted-sdk';
import type { Client } from '@bcms/selfhosted-client';
import type { Config } from '@bcms/selfhosted-cli/config';
import { sdkCreate } from '@bcms/selfhosted-cli/sdk';
import inquirer from 'inquirer';
import { PullHandler } from '@bcms/selfhosted-cli/handlers/pull';

export class Cli {
    deploy = new DeployHandler(this);
    pull = new PullHandler(this);

    private sdk: Sdk | null = null;

    constructor(
        public args: Args,
        public config: Config,
        public client?: Client,
    ) {}

    async getSdk() {
        if (!this.sdk) {
            const cmsOrigin = this.args.cmsOrigin || this.config.cmsOrigin;
            if (cmsOrigin) {
                this.sdk = await sdkCreate(cmsOrigin);
            } else {
                const answer = await inquirer.prompt<{ cmsOrigin: string }>([
                    {
                        name: 'cmsOrigin',
                        type: 'input',
                        message:
                            'Enter a URL of your BCMS (ex. https://mybcmsdomain.com',
                    },
                ]);
                this.sdk = await sdkCreate(answer.cmsOrigin);
            }
            if (!(await this.sdk.isLoggedIn())) {
                console.log('---- You will need to login to continue -----');
                let email = this.args.email;
                let password = this.args.password;
                if (!email) {
                    const answer = await inquirer.prompt<{ email: string }>([
                        {
                            name: 'email',
                            type: 'input',
                            message: 'Enter email',
                        },
                    ]);
                    email = answer.email;
                }
                if (!password) {
                    const answer = await inquirer.prompt<{ password: string }>([
                        {
                            name: 'password',
                            type: 'password',
                            message: 'Enter password',
                        },
                    ]);
                    password = answer.password;
                }
                await this.sdk.auth.login({
                    email,
                    password,
                });
            }
        }
        return this.sdk;
    }

    help() {
        console.log('---- BCMS CLI ----\n');
        const cols: Array<[string, string[]]> = [];
        let col1MaxWidth = 0;
        for (const key in argsMap) {
            const argInfo = argsMap[key];
            const col1 = argInfo.flags.join(', ');
            if (col1MaxWidth < col1.length) {
                col1MaxWidth = col1.length;
            }
            const col2Lines: string[] = [''];
            let col2LineIdx = 0;
            if (argInfo.description) {
                const descParts = argInfo.description.split(' ');
                for (let i = 0; i < descParts.length; i++) {
                    const word = descParts[i];
                    if (col2Lines[col2LineIdx].length === 0) {
                        col2Lines[col2LineIdx] += word;
                    } else {
                        col2Lines[col2LineIdx] += ' ' + word;
                    }
                    if (col2Lines[col2LineIdx].length > 30) {
                        col2Lines.push('');
                        col2LineIdx++;
                    }
                }
            }
            cols.push([col1, col2Lines]);
        }
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            const delta = Array(col1MaxWidth - col[0].length)
                .map(() => '')
                .join(' ');
            const lineIndent = Array(col[0].length + delta.length + 5)
                .map(() => '')
                .join(' ');
            console.log(delta + col[0], '->', col[1][0]);
            for (let j = 1; j < col[1].length; j++) {
                console.log(lineIndent + col[1][j]);
            }
        }
    }
}
