import { ObjectId } from 'mongodb';
import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    createMongoDBRepository,
    type MongoDBEntry,
} from '@bcms/selfhosted-backend/_server/modules/mongodb';
import { Logger, type Module } from '@bcms/selfhosted-backend/_server';

interface Migration extends MongoDBEntry {
    lastMigrationId: string;
}
const MigrationSchema: ObjectSchema = {
    lastMigrationId: {
        __type: 'string',
        __required: true,
    },
};

export const MigrationRepo = createMongoDBRepository<Migration>({
    name: 'Migration',
    collection: '__migrations',
    schema: MigrationSchema,
});

export function createMigrations(): Module {
    const migrations: Array<{ id: string; handler: () => Promise<void> }> = [
        // @next
    ];
    const logger = new Logger('Migrations');

    async function run() {
        let migration = (await MigrationRepo.findAll())[0];
        let latch = false;
        if (migration) {
            if (!migration.lastMigrationId) {
                latch = true;
            }
        } else {
            migration = await MigrationRepo.add({
                _id: `${new ObjectId()}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                lastMigrationId: '',
            });
            latch = true;
        }
        for (let i = 0; i < migrations.length; i++) {
            const mig = migrations[i];
            if (latch) {
                logger.info('run', `    -> ${mig.id}`);
                await mig.handler();
                migration.lastMigrationId = mig.id;
                await MigrationRepo.update(migration);
            } else if (mig.id === migration.lastMigrationId) {
                latch = true;
            }
        }
    }

    return {
        name: 'Migrations',
        initialize({ next }) {
            run()
                .then(() => next())
                .catch((err) => next(err));
        },
    };
}
