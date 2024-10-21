import { FS } from '@bcms/selfhosted-utils/fs';

export async function setup() {
    const rootFs = new FS(process.cwd());
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
        ['backend', 'custom-package.json'],
        ['ui', '.env'],
    ];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!(await rootFs.exist(file, true))) {
            await rootFs.save(file, '');
        }
    }
}
