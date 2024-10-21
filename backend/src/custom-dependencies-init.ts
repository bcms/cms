import type { Module } from '@bcms/selfhosted-backend/_server';
import { FS } from '@bcms/selfhosted-utils/fs';
import { ChildProcess } from '@bcms/selfhosted-utils/child-process';

export function createCustomDependenciesInit(): Module {
    return {
        name: 'Custom dependencies',
        initialize({ next }) {
            async function init() {
                const fs = new FS(process.cwd());
                if (await fs.exist('custom-package.json', true)) {
                    try {
                        const jsonStr = await fs.readString(
                            'custom-package.json',
                        );
                        if (!jsonStr.startsWith('{')) {
                            return;
                        }
                        const customPackageJson = JSON.parse(jsonStr);
                        const packageJson = JSON.parse(
                            (await fs.read('package.json')).toString(),
                        );
                        for (const depName in customPackageJson.dependencies) {
                            packageJson.dependencies[depName] =
                                customPackageJson.dependencies[depName];
                        }
                        await fs.save(
                            'package.json',
                            JSON.stringify(packageJson, null, '  '),
                        );
                        await ChildProcess.spawn('npm', ['i']);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
            init()
                .then(() => next())
                .catch((err) => next(err));
        },
    };
}
