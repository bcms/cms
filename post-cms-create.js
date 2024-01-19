const path = require("path");
const childProcess = require("child_process");

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
            stdio: "inherit",
          }
    );
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(code);
      } else {
        resolve();
      }
    });
  });
}

function advancedExec(cmd, options) {
  const output = {
    stop: undefined,
    awaiter: undefined,
  };
  output.awaiter = new Promise((resolve, reject) => {
    const proc = childProcess.exec(
      cmd instanceof Array ? cmd.join(" ") : cmd,
      options
    );
    output.stop = () => {
      const result = proc.kill();
      if (result) {
        resolve();
      } else {
        reject(Error("Failed to kill process"));
      }
    };
    if (options && options.onChunk) {
      const onChunk = options.onChunk;
      if (proc.stderr) {
        proc.stderr.on("data", (chunk) => {
          onChunk("stderr", chunk);
        });
      }
      if (proc.stdout) {
        proc.stdout.on("data", (chunk) => {
          onChunk("stdout", chunk);
        });
      }
    }
    proc.on("close", (code) => {
      if (options && options.doNotThrowError) {
        resolve();
      } else if (code !== 0) {
        reject(Error(`Failed to execute "${cmd}" with status code ${code}`));
      } else {
        resolve();
      }
    });
  });
  return output;
}

async function main() {
  const cmsCreatePath = path.join(__dirname, "cms-create");
  await advancedExec(`npm i`, {
    cwd: cmsCreatePath,
    onChunk: (type, chunk) => {
      process[type].write(chunk);
    },
    stdio: "inherit",
  }).awaiter;
  await advancedExec(`npm run post:cms-create`, {
    cwd: cmsCreatePath,
    onChunk: (type, chunk) => {
      process[type].write(chunk);
    },
    stdio: "inherit",
  }).awaiter;
  await advancedExec(`npm run post:cms-create:cleanup`, {
    cwd: cmsCreatePath,
    onChunk: (type, chunk) => {
      process[type].write(chunk);
    },
    stdio: "inherit",
  }).awaiter;
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
