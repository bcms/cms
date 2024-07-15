import path from 'path';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';
import { FS } from '@thebcms/selfhosted-utils/fs';
import { StringUtility } from '@thebcms/selfhosted-utils/string-utility';

const rootFs = new FS(process.cwd());

async function main() {
    const command = process.argv[2];
    switch (command) {
        case '--postinstall': {
            await postinstall();
            await setup();
            await bundleTypes();
            return;
        }
        case '--setup': {
            await setup();
            await bundleTypes();
            return;
        }
        case '--pre-commit': {
            return await preCommit();
        }
        case '--bundle-types': {
            return await bundleTypes();
        }
        default: {
            throw Error(`Unknown command: ${command}`);
        }
    }
}

async function bundleTypes() {
    await ChildProcess.spawn('npm', ['run', 'build'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
    });
    const fileTree = await rootFs.fileTree(['backend', 'dist'], '');
    for (let i = 0; i < fileTree.length; i++) {
        const fileInfo = fileTree[i];
        if (fileInfo.path.rel.endsWith('.d.ts')) {
            await rootFs.copy(
                ['backend', 'dist', fileInfo.path.rel],
                ['backend', 'types', fileInfo.path.rel],
            );
        }
    }
}

async function postinstall() {
    await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'backend'),
        stdio: 'inherit',
    });
    await ChildProcess.spawn('npm', ['i'], {
        cwd: path.join(process.cwd(), 'ui'),
        stdio: 'inherit',
    });
}

async function setup() {
    const dirs = [
        ['db'],
        ['uploads'],
        ['backups'],
        ['backend', 'logs'],
        ['backend', 'docs'],
        ['backend', 'additional'],
        ['backend', 'events'],
        ['backend', 'functions'],
        ['backend', 'jobs'],
        ['backend', 'plugins'],
    ];
    for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        if (!(await rootFs.exist(dir))) {
            await rootFs.mkdir(dir);
        }
    }
    const files = [
        ['backend', '.env'],
        ['ui', '.env'],
    ];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!(await rootFs.exist(file, true))) {
            await rootFs.save(file, '');
        }
    }
}

async function preCommit() {
    const whatToCheck = {
        backend: false,
        ui: false,
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
        } else if (p.startsWith('ui/')) {
            whatToCheck.ui = true;
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
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
