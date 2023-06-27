import { ChildProcess } from '@banez/child_process';
import { useFS } from '@becomes/purple-cheetah';
import type { Module } from '@becomes/purple-cheetah/types';
import { initBcmsChangeRepository } from './change';
import { initBcmsLanguageRepository } from './language';
import { initBcmsStatusRepository } from './status';

async function init() {
  const fs = useFS({
    base: process.cwd(),
  });
  if (await fs.exist('custom-package.json', true)) {
    const customPackageJson = JSON.parse(
      (await fs.read('custom-package.json')).toString(),
    );
    const packageJson = JSON.parse((await fs.read('package.json')).toString());
    for (const depName in customPackageJson.dependencies) {
      packageJson.dependencies[depName] =
        customPackageJson.dependencies[depName];
    }
    await fs.save('package.json', JSON.stringify(packageJson, null, '  '));
    await ChildProcess.spawn('npm', ['i']);
  }
}

export function bcmsSetup(): Module {
  return {
    name: 'Setup',
    initialize({ next }) {
      init()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}

async function postInit(): Promise<void> {
  await initBcmsStatusRepository();
  await initBcmsLanguageRepository();
  await initBcmsChangeRepository();
}

export function bcmsPostSetup(): Module {
  return {
    name: 'Post Setup',
    initialize({ next }) {
      postInit()
        .then(() => next())
        .catch((err) => next(err));
    },
  };
}
