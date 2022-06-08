const { createFS } = require('@banez/fs');
const { createConfig, createTasks } = require('@banez/npm-tool');

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
  },
});
