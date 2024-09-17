import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataBackup extends SocketEventDataDefault {
    backupId: string;
}

export const SocketEventDataBackupSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    backupId: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataBackupProgress extends SocketEventDataDefault {
    backupId: string;
    progress: number;
}

export const SocketEventDataBackupProgressSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    backupId: {
        __type: 'string',
        __required: true,
    },
    progress: {
        __type: 'number',
        __required: true,
    },
};

export type SocketEventNamesBackup = {
    backup: SocketEventDataBackup;
    backup_progress: SocketEventDataBackupProgress;
};
