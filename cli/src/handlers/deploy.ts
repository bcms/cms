import type { Cli } from '@thebcms/selfhosted-cli';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import inquirer from 'inquirer';

export class DeployHandler {
    constructor(private cli: Cli) {}

    async debian() {
        let packageListStr = '';
        await ChildProcess.advancedExec('apt list', {
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
                console.log('\n\nAborting...');
                return;
            }
        }
    }
}
