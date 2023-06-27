const { createFS } = require('@banez/fs');
const { createConfig, createTasks } = require('@banez/npm-tool');
const nodeFs = require('fs/promises');
const path = require('path');

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
        await fs.move(cItem, ['..', cItem])
      }
      await fs.deleteDir(['..', 'cms-create'])
      await fs.save(['..', 'package.json'], JSON.stringify(packageJson, null, '  '));
    },
  },
});
