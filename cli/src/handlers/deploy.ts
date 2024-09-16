import type { Cli } from '@thebcms/selfhosted-cli';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import inquirer from 'inquirer';
import { StringUtility } from '@thebcms/selfhosted-utils/string-utility';
import * as os from 'node:os';
import * as path from 'node:path';
import cuid2 from '@paralleldrive/cuid2';
import { FS } from '@thebcms/selfhosted-utils/fs';

export class DeployHandler {
    constructor(private cli: Cli) {}

    async debian() {
        let packageListStr = '';
        await ChildProcess.advancedExec('apt list', {
            doNotThrowError: true,
            onChunk(type, chunk) {
                if (type === 'stdout') {
                    packageListStr += chunk;
                }
            },
        }).awaiter;
        const packageList = packageListStr.split('\n').map((line) => {
            const [name, version] = line.split('/');
            return {
                name,
                version,
            };
        });
        const packagesToInstallMap = {
            git: true,
            docker: true,
        };
        for (let i = 0; i < packageList.length; i++) {
            const item = packageList[i];
            if (item.name === 'git') {
                packagesToInstallMap.git = false;
            } else if (item.name === 'docker.io') {
                packagesToInstallMap.docker = false;
            }
        }
        const packagesToInstall: string[] = [];
        for (const k in packagesToInstallMap) {
            const key = k as keyof typeof packagesToInstallMap;
            if (packagesToInstallMap[key]) {
                packagesToInstall.push(key);
            }
        }
        if (packagesToInstall.length > 0) {
            const answer = await inquirer.prompt<{ ok: boolean }>([
                {
                    name: 'ok',
                    type: 'confirm',
                    message: `Your system is missing packages: ${packagesToInstall.join(', ')}\nWe need to install them to continue.`,
                },
            ]);
            if (!answer.ok) {
                console.log('\nAborting...');
                return;
            }
        }
        let projectName = this.cli.args.projectName;
        if (!projectName) {
            const answer = await inquirer.prompt<{ projectName: string }>([
                {
                    name: 'projectName',
                    type: 'input',
                    message: 'Enter a project name',
                    transformer(input) {
                        return StringUtility.toSlug(input);
                    },
                },
            ]);
            projectName = StringUtility.toSlug(answer.projectName);
        }
        await ChildProcess.advancedExec(
            `mkdir ~/${projectName} ~/${projectName}/db ~/${projectName}/uploads ~/${projectName}/backups && cd ~/${projectName} && git clone https://github.com/bcms/cms`,
            {
                onChunk(type, chunk) {
                    process[type].write(chunk);
                },
            },
        ).awaiter;
        await ChildProcess.advancedExec(
            `cd ~/${projectName}/cms && git checkout standalone && docker build . -t ${projectName}`,
            {
                onChunk(type, chunk) {
                    process[type].write(chunk);
                },
            },
        ).awaiter;
        let dockerNetworkOutput = '';
        await ChildProcess.advancedExec(`docker network ls`, {
            doNotThrowError: true,
            onChunk(type, chunk) {
                if (type === 'stdout') {
                    dockerNetworkOutput += chunk;
                }
            },
        }).awaiter;
        if (!dockerNetworkOutput.includes('bcms-net')) {
            await ChildProcess.advancedExec(
                `docker network create -d bridge --subnet 20.30.0.0/16 --ip-range 20.30.40.0/24 --gateway 20.30.40.1 bcms-net`,
                {
                    onChunk(type, chunk) {
                        process[type].write(chunk);
                    },
                },
            ).awaiter;
        }
        const createDb = await inquirer.prompt<{ yes: boolean }>([
            {
                name: 'yes',
                type: 'confirm',
                message: `Would you like to create a MongoDB?`,
            },
        ]);
        const fs = new FS(path.join(os.homedir(), projectName));
        let dbUrl = '';
        if (createDb.yes) {
            const username = StringUtility.toSlug(cuid2.createId());
            const pass = StringUtility.toSlug(cuid2.createId());
            dbUrl = `mongodb://${username}:${pass}@${projectName}-db:27017/admin`;
            await fs.save(
                'db-info.json',
                JSON.stringify({ username, password: pass }, null, 4),
            );
            console.log(
                `\nDB information saves to: ${fs.baseRoot}/db-info.json`,
            );
            await ChildProcess.advancedExec(
                `cd ~/${projectName} && chmod 600 db-info.json && docker run -d --name ${projectName}-db -v ~/${projectName}/db:/data/db -e MONGO_INITDB_ROOT_USERNAME=${username} -e MONGO_INITDB_ROOT_PASSWORD=${pass} --network bcms-net mongo:7`,
                {
                    onChunk(type, chunk) {
                        process[type].write(chunk);
                    },
                },
            ).awaiter;
        } else {
            const answer = await inquirer.prompt<{ dbUrl: string }>([
                {
                    name: 'dbUrl',
                    type: 'input',
                    message: 'Enter MongoDB URL',
                },
            ]);
            dbUrl = answer.dbUrl;
        }
        await fs.save('app.env', [`DB_URL=${dbUrl}`].join('\n'));
        await ChildProcess.advancedExec(
            `cd ~/${projectName} && chmod 600 app.env && docker run -d --name ${projectName} -v ~/${projectName}/uploads:/app/backend/uploads -v ~/${projectName}/backups:/app/backend/backups --env-file ~/${projectName}/app.env --network bcms-net ${projectName}`,
            {
                onChunk(type, chunk) {
                    process[type].write(chunk);
                },
            },
        ).awaiter;
        let nginxConfig = await fs.readString(['cms', 'deployment-nginx.conf']);
        const proxyConfig = {
            port: '80',
            serverName: '_',
            sslCrt: '',
            sslKey: '',
        };
        const setupDomain = await inquirer.prompt<{ yes: boolean }>([
            {
                name: 'yes',
                type: 'confirm',
                message:
                    'Do you have a domain name to connect with the BCMS project?',
            },
        ]);
        if (setupDomain.yes) {
            const serverName = await inquirer.prompt<{
                name: string;
                setupSsl: boolean;
            }>([
                {
                    name: 'name',
                    type: 'input',
                    message: 'Domain name (ex. cms.my-domain.com)',
                },
                {
                    name: 'setupSsl',
                    type: 'confirm',
                    message: 'Do you want to use SSL?',
                },
            ]);
            proxyConfig.serverName = serverName.name;
            if (serverName.setupSsl) {
                proxyConfig.port = '443';
                const ssl = await inquirer.prompt<{ crt: string; key: string }>(
                    [
                        {
                            name: 'crt',
                            type: 'input',
                            message: 'Insert SSL certificate',
                        },
                        {
                            name: 'key',
                            type: 'input',
                            message: 'Insert SSL key',
                        },
                    ],
                );
                proxyConfig.sslCrt = ssl.crt;
                proxyConfig.sslKey = ssl.key;
                await fs.save(['ssl', 'crt'], proxyConfig.sslCrt);
                await fs.save(['ssl', 'key'], proxyConfig.sslKey);
                await ChildProcess.advancedExec(
                    `cd ~/${projectName}/ssl && chmod 600 key`,
                    {
                        onChunk(type, chunk) {
                            process[type].write(chunk);
                        },
                    },
                ).awaiter;
            }
        }
        nginxConfig = nginxConfig
            .replace(/@port/g, proxyConfig.port)
            .replace(/@server_name/g, proxyConfig.serverName)
            .replace(/@project_name/g, projectName);
        if (proxyConfig.sslKey) {
            nginxConfig = nginxConfig.replace(
                /@ssl/g,
                `ssl_certificate ${os.homedir()}/${projectName}/ssl/crt;\nssl_certificate_key ${os.homedir()}/${projectName}/ssl/key;`,
            );
        } else {
            nginxConfig = nginxConfig.replace(/@ssl/g, '');
        }
        await fs.save(['proxy.conf'], nginxConfig);
    }
}
