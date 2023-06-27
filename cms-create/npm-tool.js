const { createFS } = require('@banez/fs');
const { createConfig, createTasks } = require('@banez/npm-tool');
const nodeFs = require('fs/promises');
const path = require('path');
const { StringUtility } = require('@becomes/purple-cheetah');

const fs = createFS({
  base: process.cwd(),
});

module.exports = createConfig({
  custom: {
    '--setup': async () => {
      await createTasks([
        {
          title: 'Setup dirs',
          task: async () => {
            if (!(await fs.exist('db'))) {
              await fs.mkdir('db');
            }
            if (!(await fs.exist('uploads'))) {
              await fs.mkdir('uploads');
            }
          },
        },
      ]).run();
    },

    // CLEAN_UP START
    '--post-cms-create': async () => {
      const packageJson = JSON.parse(await fs.readString('package.json'));
      delete packageJson.scripts['post:cms-create'];
      const items = await fs.readdir('..');
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item !== 'cms-create') {
          const stat = await nodeFs.stat(path.join(process.cwd(), '..', item));
          if (stat.isFile()) {
            await fs.deleteFile(['..', item]);
          } else {
            await fs.deleteDir(['..', item]);
          }
        }
      }
      const cItems = await fs.readdir('');
      for (let i = 0; i < cItems.length; i++) {
        const cItem = cItems[i];
        await fs.move(cItem, ['..', cItem]);
      }
      await fs.save(
        ['..', 'package.json'],
        JSON.stringify(packageJson, null, '  '),
      );
    },

    '--post-cms-create-cleanup': async () => {
      await fs.deleteDir('cms-create');
      const data = await fs.readString('npm-tool.js');
      const cut = StringUtility.textBetween(
        data,
        '// CLEAN_UP START',
        '// CLEAN_UP END',
      );
      await fs.save(
        'npm-tool.js',
        data.replace(`// CLEAN_UP START${cut}// CLEAN_UP END`),
      );
    },
    // CLEAN_UP END
  },
});
