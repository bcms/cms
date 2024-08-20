import {
    type BCMSEvent,
    type BCMSEventDataType,
    BCMSEventSchema,
    type BCMSEventScope,
    type BCMSEventType,
} from '@thebcms/selfhosted-backend/event/models/main';
import { FS } from '@thebcms/selfhosted-utils/fs';
import path from 'path';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@thebcms/selfhosted-utils/object-utility';

export class EventManager {
    private static events: BCMSEvent[] = [];

    static async trigger<Scope extends BCMSEventScope = BCMSEventScope>(
        type: BCMSEventType,
        scope: Scope,
        data: BCMSEventDataType[Scope],
    ): Promise<void> {
        for (let i = 0; i < this.events.length; i++) {
            try {
                if (
                    (scope === this.events[i].config.scope ||
                        this.events[i].config.scope === 'all') &&
                    (type === this.events[i].config.type ||
                        this.events[i].config.type === 'all')
                ) {
                    await this.events[i].handler(type, scope, data);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    static async init(): Promise<void> {
        const fs = new FS(path.join(process.cwd(), 'events'));
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
                const eventImport: {
                    default(): Promise<BCMSEvent>;
                } = await import(path.join(fs.baseRoot, fileName));
                if (typeof eventImport.default !== 'function') {
                    throw Error(
                        `There is no default function export in: ${fileName}`,
                    );
                }
                const event = await eventImport.default();
                const checkFn = ObjectUtility.compareWithSchema(
                    event,
                    BCMSEventSchema,
                    fileName,
                );
                if (checkFn instanceof ObjectUtilityError) {
                    throw Error(checkFn.message);
                }
                this.events.push(event);
            }
        }
    }
}
