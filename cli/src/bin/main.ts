// #!/usr/bin/env node

import { getArgs } from '@thebcms/selfhosted-cli/args';
import { Cli } from '@thebcms/selfhosted-cli';

async function main() {
    const args = getArgs();
    const cli = new Cli(args);

    if (args.deploy) {
        if (args.deploy === 'debian' || args.deploy === 'ubuntu') {
            await cli.deploy.debian();
            return;
        }
    } else {
        console.warn('Unknown combination of arguments');
        cli.help();
    }
}
main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
