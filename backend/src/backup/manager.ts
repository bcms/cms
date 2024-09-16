import { v4 as uuidv4 } from 'uuid';
import nodeFs from 'fs';
import path from 'path';
import type { Backup } from '@thebcms/selfhosted-backend/backup/models/main';
import { createQueue, QueueError } from '@thebcms/selfhosted-utils/queue';
import { Logger } from '@thebcms/selfhosted-backend/_server';
import { Repo } from '@thebcms/selfhosted-backend/repo';
import { SocketManager } from '@thebcms/selfhosted-backend/socket/manager';
import { FS } from '@thebcms/selfhosted-utils/fs';
import { ChildProcess } from '@thebcms/selfhosted-utils/child-process';

export class BackupManager {
    private static fs = new FS(process.cwd());
    private static logger = new Logger('BackupManager');
    private static createQueue = createQueue<void>();

    static async getFileStream(backup: Backup): Promise<nodeFs.ReadStream> {
        if (!(await this.fs.exist(['backups', backup._id + '.zip'], true))) {
            throw Error(`File for backup "${backup._id}" does not exist`);
        }
        return nodeFs.createReadStream(
            path.join(process.cwd(), 'backups', backup._id + '.zip'),
        );
    }

    static async create(backup: Backup) {
        const queueResult = await this.createQueue({
            name: 'create',
            handler: async () => {
                backup.inQueue = false;
                await Repo.backup.update(backup);
                SocketManager.channelEmit(['global'], 'backup', {
                    backupId: backup._id,
                    type: 'update',
                });
                await this.fs.save(
                    [backup._id + '-db', 'api-keys.json'],
                    JSON.stringify(await Repo.apiKey.findAll()),
                );
                await this.fs.save(
                    [backup._id + '-db', 'entries.json'],
                    JSON.stringify(await Repo.entry.findAll()),
                );
                await this.fs.save(
                    [backup._id + '-db', 'entry-statuses.json'],
                    JSON.stringify(await Repo.entryStatus.findAll()),
                );
                await this.fs.save(
                    [backup._id + '-db', 'groups.json'],
                    JSON.stringify(await Repo.group.findAll()),
                );
                await this.fs.save(
                    [backup._id + '-db', 'languages.json'],
                    JSON.stringify(await Repo.language.findAll()),
                );
                const medias = await Repo.media.findAll();
                await this.fs.save(
                    [backup._id + '-db', 'media.json'],
                    JSON.stringify(medias),
                );
                await this.fs.save(
                    [backup._id + '-db', 'templates.json'],
                    JSON.stringify(await Repo.template.findAll()),
                );
                await this.fs.save(
                    [backup._id + 'db', 'template-organizers.json'],
                    JSON.stringify(await Repo.templateOrganizer.findAll()),
                );
                await this.fs.save(
                    [backup._id + '-db', 'users.json'],
                    JSON.stringify(await Repo.user.findAll()),
                );
                await this.fs.save(
                    [backup._id + '-db', 'widgets.json'],
                    JSON.stringify(await Repo.widget.findAll()),
                );
                if (!(await this.fs.exist('backups'))) {
                    await this.fs.mkdir('backups');
                }
                await this.fs.save(
                    `${backup._id}-metadata.json`,
                    JSON.stringify({
                        version: '4',
                    }),
                );
                const cout = {
                    stdout: '',
                    stderr: '',
                };
                await ChildProcess.advancedExec(
                    `zip -r backups/${backup._id}.zip ${backup._id}-db uploads ${backup._id}-metadata.json`,
                    {
                        cwd: process.cwd(),
                        onChunk(type, chunk) {
                            cout[type] += chunk;
                        },
                    },
                ).awaiter;
                await this.fs.deleteDir(`${backup._id}-db`);
                await this.fs.deleteFile(`${backup._id}-metadata.json`);
                const zipStats = await new Promise<nodeFs.Stats>(
                    (resolve, reject) => {
                        nodeFs.stat(
                            path.join(
                                process.cwd(),
                                'backups',
                                backup._id + '.zip',
                            ),
                            (err, stats) => {
                                if (err) {
                                    reject(err);
                                }
                                resolve(stats);
                            },
                        );
                    },
                );
                backup.size = zipStats.size;
                backup.inQueue = false;
                backup.ready = true;
                backup.doneAt = Date.now();
                await Repo.backup.update(backup);
                SocketManager.channelEmit(['global'], 'backup', {
                    backupId: backup._id,
                    type: 'update',
                });
            },
        }).wait;
        if (queueResult instanceof QueueError) {
            this.logger.error('create', queueResult.error);
        }
    }

    static async remove(backupId: string) {
        await this.fs.deleteFile(['backups', backupId + '.zip']);
    }

    static async restore(fileBuffer: Buffer): Promise<void> {
        const id = uuidv4();
        await this.fs.save(['restore', id, 'data.zip'], fileBuffer);
        await ChildProcess.spawn('unzip', ['data.zip'], {
            cwd: path.join(process.cwd(), 'restore', id),
            stdio: 'inherit',
        });
    }
}
