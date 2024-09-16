import type { Module } from '@thebcms/selfhosted-backend/_server';
import { keyValueStore } from '@thebcms/selfhosted-backend/key-value-store';

export class EntrySyncChannelHandler {
    private channelBase = 'entrySync.channel';

    addConnection(
        entryId: string,
        connId: string,
        userId: string,
        age: number,
    ) {
        const key = `${this.channelBase}.${entryId}.${connId}.${userId}`;
        keyValueStore.set(key, `${entryId}.${connId}.${userId}.${age}`, {
            expIn: 70,
        });
    }

    getConnectionValue(entryId: string, connId: string, userId: string) {
        const key = `${this.channelBase}.${entryId}.${connId}.${userId}`;
        return keyValueStore.get(key);
    }

    getConnectionInfoFromKey(connKey: string) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_b1, _b2, entryId, connId, userId] = connKey.split('.');
        return {
            entryId,
            userId,
            connId,
        };
    }

    getConnectionInfoFromValue(connValue: string) {
        const [entryId, connId, userId, port, age] = connValue.split('.');
        return {
            entryId,
            userId,
            connId,
            port,
            age: parseInt(age),
        };
    }

    getAllKeysInfo() {
        const keys = keyValueStore.keys(this.channelBase + '.');
        const output: Array<{
            entryId: string;
            connId: string;
            userId: string;
        }> = [];
        for (let i = 0; i < keys.length; i++) {
            output.push(this.getConnectionInfoFromKey(keys[i]));
        }
        return output;
    }

    getConnectionKeys(entryId: string) {
        return keyValueStore.keys(`${this.channelBase}.${entryId}.`);
    }

    getConnection(entryId: string, connId: string, userId: string) {
        const key = `${this.channelBase}.${entryId}.${connId}.${userId}`;
        return keyValueStore.get(key);
    }

    getConnections(entryId: string) {
        const keys = this.getConnectionKeys(entryId);
        const values = keys.length > 0 ? keyValueStore.mGet(keys) : [];
        const output: Array<{
            key: string;
            value: string;
        }> = [];
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = values[i];
            if (value) {
                output.push({ key, value });
            }
        }
        return output;
    }

    async getConnectionsInfo(entryId: string) {
        const conns = await this.getConnections(entryId);
        return conns.map((conn) => {
            return {
                key: this.getConnectionInfoFromKey(conn.key),
                value: this.getConnectionInfoFromValue(conn.value),
            };
        });
    }

    async getConnectionIds(entryId: string) {
        const keys = await this.getConnectionKeys(entryId);
        return keys.map((e) => e.split('.')[3]);
    }

    getFromConnectionKey(
        value: 'entryId' | 'connId' | 'userId',
        connectionKey: string,
    ) {
        const info = this.getConnectionInfoFromKey(connectionKey);
        return info[value];
    }

    removeConnection(entryId: string, connId: string, userId: string) {
        keyValueStore.del(`${this.channelBase}.${entryId}.${connId}.${userId}`);
    }
}

let handler: EntrySyncChannelHandler | null;

export function useEntrySyncChannelHandler() {
    return handler as EntrySyncChannelHandler;
}

/**
 * Must be called after redis has been mounted
 */
export function createEntrySyncChannelHandler(): Module {
    return {
        name: 'EntrySyncConnectionHandler',
        initialize({ next }) {
            handler = new EntrySyncChannelHandler();
            next();
        },
    };
}
