const { ChildProcess } = require('@banez/child_process');
const { createConfig, createTasks } = require('@banez/npm-tool');
const path = require('path');
const { createFS } = require('@banez/fs');

const fs = createFS({
  base: process.cwd(),
});

/**
 *
 * @param {{
 *  dirPath: string;
 *  basePath: string;
 *  endsWith?: string[];
 *  regex: RegExp[];
 * }} config
 * @returns {Promise<void>}
 */
async function fileReplacer(config) {
  const filePaths = await fs.fileTree(config.dirPath, '');
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    if (
      config.endsWith &&
      !!config.endsWith.find((e) => filePath.path.abs.endsWith(e))
    ) {
      let replacer = config.basePath;
      if (filePath.dir !== '') {
        const depth = filePath.dir.split('/').length;
        replacer = new Array(depth).fill('..').join('/') + '' + config.basePath;
      }
      const file = await fs.readString(filePath.path.abs);
      let fileFixed = file + '';
      for (let j = 0; j < config.regex.length; j++) {
        const regex = config.regex[j];
        fileFixed = fileFixed.replace(regex, replacer);
      }
      if (file !== fileFixed) {
        await fs.save(filePath.path.abs, fileFixed);
      }
    }
  }
}

module.exports = createConfig({
  custom: {
    '--postinstall': async () => {
      await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
      });
      await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'ui'),
        stdio: 'inherit',
      });
      await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'ui', 'sdk'),
        stdio: 'inherit',
      });
    },

    '--build-types': async () => {
      await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
      });
      if (await fs.exist(['sdk', 'src', 'backend-types'])) {
        await fs.deleteDir(['sdk', 'src', 'backend-types']);
      }
      await fileReplacer({
        basePath: '',
        dirPath: ['backend', 'dist'],
        regex: [
          /@backend/g,
          /@bcms/g,
          /@becomes\/cms-backend/g,
          /@becomes\/cms-backend\/src/g,
        ],
        endsWith: ['.js', '.d.ts'],
      });
      const tree = (await fs.fileTree(['backend', 'dist'], '')).filter((e) =>
        e.path.rel.endsWith('.d.ts')
      );
      for (let i = 0; i < tree.length; i++) {
        const item = tree[i];
        const pathParts = item.path.rel.split('/');
        await fs.copy(
          ['backend', 'dist', ...pathParts],
          ['ui', 'sdk', 'src', 'backend-types', ...pathParts]
        );
      }
    },
  },
});
