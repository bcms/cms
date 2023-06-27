const path = require('path');
const childProcess = require('child_process');

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {import('child_process').SpawnOptions?} options
 */
async function spawn(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const proc = childProcess.spawn(
      cmd,
      args,
      options
        ? options
        : {
            stdio: 'inherit',
          }
    );
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  await spawn('npm', ['i'], {
    cwd: path.join(process.cwd(), 'cms-create'),
    stdio: 'inherit',
  });
  await spawn('npm', ['run', 'post:cms-create'], {
    cwd: path.join(process.cwd(), 'cms-create'),
    stdio: 'inherit',
  });
  await spawn('npm', ['run', 'post:cms-create:cleanup']);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
