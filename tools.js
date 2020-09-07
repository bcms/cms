const childProcess = require('child_process');
const path = require('path');
const fse = require('fs-extra');
const fs = require('fs');
const util = require('util');

const exec = async (cmd, output) => {
  return new Promise((resolve, reject) => {
    const proc = childProcess.exec(cmd);
    if (output) {
      proc.stdout.on('data', (data) => {
        output('stdout', data);
      });
      proc.stderr.on('data', (data) => {
        output('stderr', data);
      });
    }
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
};

const parseArgs = (rawArgs) => {
  const args = {};
  let i = 2;
  while (i < rawArgs.length) {
    const arg = rawArgs[i];
    let value = '';
    if (rawArgs[i + 1]) {
      value = rawArgs[i + 1].startsWith('--') ? '' : rawArgs[i + 1];
    }
    args[arg] = value;
    if (value === '') {
      i = i + 1;
    } else {
      i = i + 2;
    }
  }
  return {
    bundle: args['--bundle'] === '' || args['--bundle'] === 'true' || false,
    build: args['--build'] === '' || args['--build'] === 'true' || false,
    link: args['--link'] === '' || args['--link'] === 'true' || false,
    unlink: args['--unlink'] === '' || args['--unlink'] === 'true' || false,
    publish: args['--publish'] === '' || args['--publish'] === 'true' || false,
  };
};
/**
 * @param {Array<{
 *  title: string;
 *  task: () => Promise<void>;
 * }>} tasks
 */
const Tasks = (tasks) => {
  return {
    run: async () => {
      for (let i = 0; i < tasks.length; i = i + 1) {
        const t = tasks[i];
        console.log(`${i + 1}. ${t.title}`);
        try {
          await t.task();
          console.log(`✓`);
        } catch (error) {
          console.log(`⨉`);
          throw error;
        }
      }
    },
  };
};
const bundle = async () => {
  const tasks = Tasks([
    {
      title: 'Remove old bundle.',
      task: async () => {
        await fse.remove(path.join(__dirname, 'dist'));
      },
    },
    {
      title: 'Compile Typescript.',
      task: async () => {
        await exec('npm run build:ts');
      },
    },
    {
      title: 'Compile Svelte.',
      task: async () => {
        await exec('npm run build:svelte');
      },
    },
    {
      title: 'Copy BIN to dist',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'bin'),
          path.join(__dirname, 'dist', 'bin'),
        );
      },
    },
    {
      title: 'Copy frontend assets to dist',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'public'),
          path.join(__dirname, 'dist', 'frontend'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'components'),
          path.join(__dirname, 'dist', 'frontend', 'components'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'styles'),
          path.join(__dirname, 'dist', 'frontend', 'styles'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'custom'),
          path.join(__dirname, 'dist', 'frontend', 'custom'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'axios-client.js'),
          path.join(__dirname, 'dist', 'frontend', 'axios-client.js'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'store.js'),
          path.join(__dirname, 'dist', 'frontend', 'store.js'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'string-util.js'),
          path.join(__dirname, 'dist', 'frontend', 'string-util.js'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'base64.js'),
          path.join(__dirname, 'dist', 'frontend', 'base64.js'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'url-queries.js'),
          path.join(__dirname, 'dist', 'frontend', 'url-queries.js'),
        );
        await fse.copy(
          path.join(__dirname, 'src', 'frontend', 'config.svelte'),
          path.join(__dirname, 'dist', 'frontend', 'config.svelte'),
        );
        await fse.copy(
          path.join(__dirname, 'public', 'index.html'),
          path.join(__dirname, 'dist', 'frontend', 'index.html'),
        );
      },
    },
    {
      title: 'Copy package.json',
      task: async () => {
        const data = JSON.parse(
          (
            await util.promisify(fs.readFile)(
              path.join(__dirname, 'package.json'),
            )
          ).toString(),
        );
        data.devDependencies = undefined;
        data.nodemonConfig = undefined;
        data.scripts = undefined;
        await util.promisify(fs.writeFile)(
          path.join(__dirname, 'dist', 'package.json'),
          JSON.stringify(data, null, '  '),
        );
      },
    },
    {
      title: 'Copy LICENSE',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'LICENSE'),
          path.join(__dirname, 'dist', 'LICENSE'),
        );
      },
    },
    {
      title: 'Copy README.md',
      task: async () => {
        await fse.copy(
          path.join(__dirname, 'README.md'),
          path.join(__dirname, 'dist', 'README.md'),
        );
      },
    },
  ]);
  await tasks.run();
};
const build = async () => {
  const tasks = Tasks([
    {
      title: 'Remove old bundle.',
      task: async () => {
        await fse.remove(path.join(__dirname, 'tmp'));
      },
    },
    {
      title: 'Compile Typescript.',
      task: async () => {
        await exec('npm run build:ts');
        await fse.copy(
          path.join(__dirname, 'tmp', 'src'),
          path.join(__dirname, 'dist'),
        );
      },
    },
  ]);
  await tasks.run();
};
const publish = async () => {
  if (await fse.exists(path.join(__dirname, 'dist', 'node_modules'))) {
    throw new Error(
      `Please remove "${path.join(__dirname, 'dist', 'node_modules')}"`,
    );
  }
  await exec('cd dist && npm publish --access=restricted');
};

async function main() {
  const options = parseArgs(process.argv);
  if (options.bundle === true) {
    await bundle();
  } else if (options.build === true) {
    await build();
  } else if (options.link === true) {
    await exec('cd dist && npm i && sudo npm link');
  } else if (options.unlink === true) {
    await exec('cd dist && sudo npm unlink');
  } else if (options.publish === true) {
    await publish();
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
