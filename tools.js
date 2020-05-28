const Listr = require('listr');
const childProcess = require('child_process');
const fse = require('fs-extra');
const fs = require('fs');
const util = require('util');
const path = require('path');

const exec = async (cmd, output) => {
  return new Promise((resolve, reject) => {
    const proc = childProcess.exec(cmd);
    if (output) {
      proc.stdout.on('data', data => {
        output('stdout', data);
      });
      proc.stderr.on('data', data => {
        output('stderr', data);
      });
    }
    proc.on('close', code => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
};

const parseArgs = rawArgs => {
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
    link: args['--link'] === '' || args['--link'] === 'true' || false,
    unlink: args['--unlink'] === '' || args['--unlink'] === 'true' || false,
    publish: args['--publish'] === '' || args['--publish'] === 'true' || false,
  };
};
const bundle = async () => {
  const tasks = new Listr([
    {
      title: 'Remove dist directory.',
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
      title: 'Compile Webpack.',
      task: async () => {
        await exec('npm run build:wp');
      },
    },
    {
      title: 'Copy frontend assets.',
      task: async () => {
        const list = [
          {
            from: 'public',
            to: 'public',
          },
          {
            from: 'components',
            to: 'components',
          },
        ];
        for (const i in list) {
          await fse.copy(
            path.join(__dirname, 'src', 'frontend', list[i].from),
            path.join(__dirname, 'dist', 'frontend', list[i].to),
          );
        }
      },
    },
    {
      title: 'Copy bin to dist.',
      task: async () => {
        await exec('cp -R bin dist');
      },
    },
    {
      title: 'Copy package.json.',
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
  ]);
  await tasks.run();
};
const link = async () => {
  await exec('cd dist && npm i && sudo npm link');
};
const unlink = async () => {
  await exec('cd dist && sudo npm unlink');
};
const publish = async () => {
  if (await fse.exists(path.join(__dirname, 'dist', 'node_modules'))) {
    throw new Error(
      `Please remove "${path.join(__dirname, 'dist', 'node_modules')}"`,
    );
  }
  await exec('cd dist && npm publish --access=public');
};

async function main() {
  const options = parseArgs(process.argv);
  if (options.bundle === true) {
    await bundle();
  } else if (options.link === true) {
    await link();
  } else if (options.unlink === true) {
    await unlink();
  } else if (options.publish === true) {
    await publish();
  }
}
main().catch(error => {
  console.error(error);
  process.exit(1);
});
