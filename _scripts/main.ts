import { postinstall } from './postinstall';
import { setup } from './setup';
import { buildTypes } from './build-types';
import { preCommit } from './pre-commit';
import { buildClient, packClient } from './client';
import { buildBackend, buildUtils, packBackend, packUtils } from './backend';
import { buildSdk, packSdk } from './sdk';
import { buildUi, buildUiComponents, packUiComponents } from './ui';
import { publish } from './utils/publish';
import { createMainDockerImage } from './docker';
import { buildCli, packCli } from './cli';

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
        case '--publish-client': {
            await publish(['client', 'dist']);
            return;
        }
        case '--build-cli': {
            await buildCli();
            return;
        }
        case '--pack-cli': {
            await packCli();
            return;
        }
        case '--publish-cli': {
            await publish(['cli', 'dist']);
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
        case '--publish-utils': {
            await publish(['backend', 'dist-utils']);
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
        case '--publish-backend': {
            await publish(['backend', 'dist']);
            return;
        }
        case '--build-sdk': {
            await buildSdk();
            return;
        }
        case '--pack-sdk': {
            await packSdk();
            return;
        }
        case '--publish-sdk': {
            await publish(['ui', 'dist-sdk']);
            return;
        }
        case '--build-ui': {
            await buildUi();
            return;
        }
        case '--build-ui-components': {
            await buildUiComponents();
            return;
        }
        case '--pack-ui-components': {
            await packUiComponents();
            return;
        }
        case '--publish-ui-components': {
            await publish(['ui', 'dist-components']);
            return;
        }
        case '--build-docker-image': {
            await createMainDockerImage();
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
