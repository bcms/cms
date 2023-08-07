const { ChildProcess } = require('@banez/child_process');
const { createConfig, createTasks } = require('@banez/npm-tool');
const path = require('path');
const { createFS } = require('@banez/fs');
const { StringUtility } = require('@banez/string-utility');

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
      await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'client'),
        stdio: 'inherit',
      });
    },

    '--setup': async () => {
      const dirs = [
        ['backend', 'db'],
        ['backend', 'db', 'mongo'],
        ['backend', 'db', 'bcms'],
        ['backend', 'uploads'],
        ['backend', 'logs'],
      ];
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        if (!(await fs.exist(dir))) {
          await fs.mkdir(dir);
        }
      }
      const files = [['backend', '.env']];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!(await fs.exist(file, true))) {
          await fs.save(file, '');
        }
      }
    },

    '--pre-commit': async () => {
      const whatToCheck = {
        backend: false,
        client: false,
        ui: false,
        sdk: false,
      };
      let gitOutput = '';
      await ChildProcess.advancedExec('git status', {
        cwd: process.cwd(),
        doNotThrowError: true,
        onChunk(type, chunk) {
          gitOutput += chunk;
          process[type].write(chunk);
        },
      }).awaiter;
      const paths = StringUtility.allTextBetween(gitOutput, '   ', '\n');
      for (let i = 0; i < paths.length; i++) {
        const p = paths[i];
        if (p.startsWith('backend/')) {
          whatToCheck.backend = true;
        } else if (p.startsWith('ui/sdk/')) {
          whatToCheck.sdk = true;
        } else if (p.startsWith('ui/')) {
          whatToCheck.ui = true;
        } else if (p.startsWith('client/')) {
          whatToCheck.client;
        }
      }
      if (whatToCheck.backend) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
          cwd: path.join(process.cwd(), 'backend'),
          stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'build:noEmit'], {
          cwd: path.join(process.cwd(), 'backend'),
          stdio: 'inherit',
        });
      }
      if (whatToCheck.ui) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
          cwd: path.join(process.cwd(), 'ui'),
          stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'type-check'], {
          cwd: path.join(process.cwd(), 'ui'),
          stdio: 'inherit',
        });
      }
      if (whatToCheck.client) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
          cwd: path.join(process.cwd(), 'client'),
          stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'build:noEmit'], {
          cwd: path.join(process.cwd(), 'client'),
          stdio: 'inherit',
        });
      }
      if (whatToCheck.sdk) {
        await ChildProcess.spawn('npm', ['run', 'lint'], {
          cwd: path.join(process.cwd(), 'ui', 'sdk'),
          stdio: 'inherit',
        });
        await ChildProcess.spawn('npm', ['run', 'build:ts:noEmit'], {
          cwd: path.join(process.cwd(), 'ui', 'sdk'),
          stdio: 'inherit',
        });
      }
    },

    '--build-types': async () => {
      await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
      });
      if (await fs.exist(['ui', 'sdk', 'src', 'backend-types'])) {
        await fs.deleteDir(['ui', 'sdk', 'src', 'backend-types']);
      }
      if (await fs.exist(['client', 'src', 'backend-types'])) {
        await fs.deleteDir(['client', 'src', 'backend-types']);
      }
      await fileReplacer({
        basePath: '',
        dirPath: ['backend', 'dist', 'src'],
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
        await fs.copy(
          ['backend', 'dist', ...pathParts],
          ['client', 'src', 'backend-types', ...pathParts]
        );
      }
    },

    '--bundle-ui': async () => {
      const ufs = createFS({
        base: path.join(process.cwd(), 'ui'),
      });
      await createTasks([
        {
          title: 'Remove dist and lib directories.',
          task: async () => {
            if (await ufs.exist('dist')) {
              await ufs.deleteDir('dist');
            }
            if (await ufs.exist('dist-components')) {
              await ufs.deleteDir('dist-components');
            }
            if (await ufs.exist('lib')) {
              await ufs.deleteDir('lib');
            }
          },
        },
        {
          title: 'Build Vue.',
          task: async () => {
            await ChildProcess.spawn('npm', ['run', 'build'], {
              cwd: path.join(process.cwd(), 'ui'),
              stdio: 'inherit',
            });
          },
        },
        {
          title: 'Create lib.',
          task: async () => {
            await ufs.mkdir('lib');
            await ufs.copy('dist', ['lib', 'public']);
            await ufs.copy(['src', 'components'], ['lib', 'components']);
            await ufs.copy(['src', 'types'], ['lib', 'types']);
            await ufs.copy(['src', 'services'], ['lib', 'services']);
            await ufs.copy(['src', 'directives'], ['lib', 'directives']);
            await ufs.copy(['src', 'util'], ['lib', 'util']);
            await ufs.copy(['src', 'translations'], ['lib', 'translations']);
            await ufs.copy(['src', 'styles'], ['lib', 'styles']);
            await ufs.copy('tailwind.config.cjs', ['lib', 'tw.js']);
            await ufs.copy('tailwind.config.cjs', [
              'lib',
              'tailwind.config.js',
            ]);
            await ufs.copy('tailwind.config.cjs', [
              'lib',
              'tailwind.config.cjs',
            ]);
          },
        },
        {
          title: 'Copy package.json.',
          task: async () => {
            const data = JSON.parse(await ufs.readString('package.json'));
            data.devDependencies = undefined;
            data.nodemonConfig = undefined;
            data.scripts = undefined;
            await ufs.save(
              ['lib', 'package.json'],
              JSON.stringify(data, null, '  ')
            );
          },
        },
        {
          title: 'Copy README',
          task: async () => {
            await ufs.copy(['README.md'], ['lib', 'README.md']);
          },
        },
        {
          title: 'Copy LICENSE',
          task: async () => {
            await fs.copy('LICENSE', ['ui', 'lib', 'LICENSE']);
          },
        },
      ]).run();
    },

    '--bundle-sdk': async () => {
      const sfs = createFS({
        base: path.join(process.cwd(), 'ui', 'sdk'),
      });
      await createTasks([
        {
          title: 'Remove old bundle.',
          task: async () => {
            await sfs.deleteDir('dist');
            await sfs.deleteDir('doc');
            await sfs.deleteDir('tmp');
          },
        },
        {
          title: 'Compile Typescript.',
          task: async () => {
            await ChildProcess.spawn('npm', ['run', 'build:ts'], {
              cwd: path.join(process.cwd(), 'ui', 'sdk'),
            });
            await sfs.deleteDir(['dist', 'test']);
            await sfs.copy(['dist', 'src'], ['dist']);
            await sfs.deleteDir(['dist', 'src']);
            await sfs.deleteDir(['dist', 'dev']);
          },
        },
        {
          title: 'Copy package.json',
          task: async () => {
            const data = JSON.parse(await sfs.readString(['package.json']));
            data.devDependencies = undefined;
            data.nodemonConfig = undefined;
            data.scripts = undefined;
            await sfs.save(
              ['dist', 'package.json'],
              JSON.stringify(data, null, '  ')
            );
          },
        },
        {
          title: 'Copy LICENSE',
          task: async () => {
            await fs.copy(['LICENSE'], ['ui', 'sdk', 'dist', 'LICENSE']);
          },
        },
        {
          title: 'Copy README.md',
          task: async () => {
            await sfs.copy(['README.md'], ['dist', 'README.md']);
          },
        },
      ]).run();
    },

    '--bundle-backend': async () => {
      const bfs = createFS({
        base: path.join(process.cwd(), 'backend'),
      });
      await createTasks([
        {
          title: 'Cleanup',
          task: async () => {
            await bfs.deleteDir('dist');
          },
        },
        {
          title: 'Build typescript',
          task: async () => {
            await ChildProcess.spawn('npm', ['run', 'build:types']);
            await bfs.move(['dist', '_index.js'], ['dist', 'index.js']);
            await bfs.move(['dist', '_index.d.ts'], ['dist', 'index.d.ts']);
            await bfs.save(
              ['dist', 'index.js'],
              (
                await bfs.readString(['dist', 'index.js'])
              ).replace(/\/_index/g, '')
            );
            await bfs.save(
              ['dist', 'index.d.ts'],
              (
                await bfs.readString(['dist', 'index.d.ts'])
              ).replace(/\/_index/g, '')
            );
            await bfs.move(
              ['dist', 'src', '_index.js'],
              ['dist', 'src', 'index.js']
            );
            await bfs.move(
              ['dist', 'src', '_index.d.ts'],
              ['dist', 'src', 'index.d.ts']
            );
          },
        },
        {
          title: 'Copy response codes',
          task: async () => {
            await bfs.copy(
              ['src', 'response-code', 'codes'],
              ['dist', 'src', 'response-code', 'codes']
            );
          },
        },
        {
          title: 'Create custom package.json',
          task: async () => {
            const packageJson = JSON.parse(
              await bfs.readString('package.json')
            );
            packageJson.devDependencies = undefined;
            packageJson.nodemonConfig = undefined;
            packageJson.scripts = {
              start: 'node src/main.js',
            };
            await bfs.save(
              ['dist', 'package.json'],
              JSON.stringify(packageJson, null, '  ')
            );
          },
        },
      ]).run();
    },

    '--bundle-backend-dev': async () => {
      const bfs = createFS({
        base: path.join(process.cwd(), 'backend'),
      });
      const tasks = createTasks([
        {
          title: 'Remove dist directory.',
          task: async () => {
            await bfs.deleteDir('dev-dist');
          },
        },
        {
          title: 'Copy src',
          task: async () => {
            await bfs.copy('src', ['dev-dist', 'src']);
          },
        },
        {
          title: 'Copy assets',
          task: async () => {
            const files = ['tsconfig.json', '.eslintrc', '.eslintignore'];
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              await bfs.copy(file, ['dev-dist', file]);
            }
            await bfs.copy(['..', 'ui', 'dist'], ['dev-dist', 'public']);
          },
        },
        {
          title: 'Copy package.json.',
          task: async () => {
            const data = JSON.parse(await bfs.readString('package.json'));
            await bfs.save(
              ['dev-dist', 'package.json'],
              JSON.stringify(data, null, '  ')
            );
          },
        },
        {
          title: 'Copy LICENSE',
          task: async () => {
            await fs.copy('LICENSE', ['backend', 'dev-dist', 'LICENSE']);
          },
        },
        {
          title: 'Copy Dockerfile',
          task: async () => {
            await bfs.copy('Dockerfile.dev', ['dev-dist', 'Dockerfile']);
          },
        },
      ]);
      await tasks.run();
    },

    '--bundle-client': async () => {
      if (await fs.exist(['client', 'dist'])) {
        await fs.deleteDir(['client', 'dist']);
      }
      await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: path.join(process.cwd(), 'client'),
        stdio: 'inherit',
      });
      const packageJson = JSON.parse(
        await fs.readString(['client', 'package.json'])
      );
      packageJson.devDependencies = undefined;
      packageJson.scripts = undefined;
      await fs.save(
        ['client', 'dist', 'package.json'],
        JSON.stringify(packageJson, null, '  ')
      );
      await fs.copy('LICENSE', ['client', 'dist', 'LICENSE']);
      await fs.copy(['client', 'README.md'], ['client', 'dist', 'README.md']);
    },

    '--publish-ui': async () => {
      if (await fs.exist('ui', 'lib', 'node_modules')) {
        throw new Error(
          `Please remove "${path.join(__dirname, 'ui', 'lib', 'node_modules')}"`
        );
      }
      await ChildProcess.spawn('npm', ['publish', '--access=public'], {
        cwd: path.join(process.cwd(), 'ui', 'lib'),
        stdio: 'inherit',
      });
    },

    '--publish-sdk': async () => {
      if (await fs.exist('ui', 'sdk', 'dist', 'node_modules')) {
        throw new Error(
          `Please remove "${path.join(
            __dirname,
            'ui',
            'sdk',
            'dist',
            'node_modules'
          )}"`
        );
      }
      await ChildProcess.spawn('npm', ['publish', '--access=public'], {
        cwd: path.join(process.cwd(), 'ui', 'sdk', 'dist'),
        stdio: 'inherit',
      });
    },

    '--create-docker-backend-image': async () => {
      const bfs = createFS({
        base: path.join(process.cwd(), 'backend'),
      });
      const tasks = createTasks([
        {
          title: 'Copy UI',
          task: async () => {
            await bfs.copy(['..', 'ui', 'dist'], ['dist', 'public']);
          },
        },
        {
          title: 'Create docker image',
          task: async () => {
            await bfs.copy('Dockerfile', ['dist', 'Dockerfile']);
            await ChildProcess.spawn(
              'docker',
              ['build', '.', '-t', 'becomes/cms-backend'],
              {
                cwd: path.join(process.cwd(), 'backend', 'dist'),
                stdio: 'inherit',
              }
            );
          },
        },
        {
          title: 'Cleanup',
          task: async () => {
            await bfs.deleteDir(['dist', 'public']);
            await bfs.deleteFile(['dist', 'Dockerfile']);
          },
        },
      ]);
      await tasks.run();
    },

    '--create-docker-backend-image-dev': async () => {
      await ChildProcess.spawn(
        'docker',
        ['build', '.', '-t', 'becomes/cms-backend-local'],
        {
          cwd: path.join(process.cwd(), 'backend', 'dev-dist'),
          stdio: 'inherit',
        }
      );
    },

    '--publish-client': async () => {
      if (await fs.exist('client', 'dist', 'node_modules')) {
        throw new Error(
          `Please remove "${path.join(
            __dirname,
            'client',
            'dist',
            'node_modules'
          )}"`
        );
      }
      await ChildProcess.spawn('npm', ['publish', '--access=public'], {
        cwd: path.join(process.cwd(), 'client', 'dist'),
        stdio: 'inherit',
      });
    },
  },
});
