import { postinstall } from './postinstall';
import { setup } from './setup';
import { buildTypes } from './build-types';
import { preCommit } from './pre-commit';
import { buildClient, packClient } from './client';
import { buildBackend, buildUtils, packBackend, packUtils } from './backend';

async function main() {
    const command = process.argv[2];
    switch (command) {
        case '--postinstall': {
            await postinstall();
            await setup();
            await buildTypes();
            return;
        }
        case '--setup': {
            await setup();
            await buildTypes();
            return;
        }
        case '--pre-commit': {
            return await preCommit();
        }
        case '--build-types': {
            return await buildTypes();
        }
        case '--build-client': {
            await buildClient();
            return;
        }
        case '--pack-client': {
            await packClient();
            return;
        }
        case '--build-utils': {
            await buildUtils();
            return;
        }
        case '--pack-utils': {
            await packUtils();
            return;
        }
        case '--build-backend': {
            await buildBackend();
            return;
        }
        case '--pack-backend': {
            await packBackend();
            return;
        }
        default: {
            throw Error(`Unknown command: ${command}`);
        }
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
