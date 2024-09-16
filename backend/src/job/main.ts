import type { Module } from '@thebcms/selfhosted-backend/_server';
import { FS } from '@thebcms/selfhosted-utils/fs';
import path from 'path';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@thebcms/selfhosted-utils/object-utility';
import {
    type BCMSJob,
    BCMSJobSchema,
} from '@thebcms/selfhosted-backend/job/models/main';
import { CronJob } from 'cron';

export function createBcmsJobs(): Module {
    async function init() {
        const fs = new FS(path.join(process.cwd(), 'jobs'));
        if (!(await fs.exist(''))) {
            return;
        }
        const fileNames = await fs.readdir('');
        for (let i = 0; i < fileNames.length; i++) {
            const fileName = fileNames[i];
            if (
                fileName.endsWith('.js') ||
                (!fileName.endsWith('.d.ts') && fileName.endsWith('.ts'))
            ) {
                const jobImport: {
                    default(): Promise<BCMSJob>;
                } = await import(path.join(fs.baseRoot, fileName));
                if (typeof jobImport.default !== 'function') {
                    throw Error(
                        `There is no default function export in: ${fileName}`,
                    );
                }
                const job = await jobImport.default();
                const checkFn = ObjectUtility.compareWithSchema(
                    job,
                    BCMSJobSchema,
                    fileName,
                );
                if (checkFn instanceof ObjectUtilityError) {
                    throw Error(checkFn.message);
                }
                new CronJob(
                    job.cronTime,
                    async () => {
                        try {
                            await job.handler();
                        } catch (err) {
                            console.error(err);
                        }
                    },
                    null,
                    true,
                );
            }
        }
    }

    return {
        name: 'Job mount',
        initialize({ next }) {
            init()
                .then(() => next())
                .catch((err) => next(err));
        },
    };
}
