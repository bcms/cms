import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'isomorphic-ws';
import type {
    SocketEventData,
    SocketEventDataConnection,
    SocketEventName,
    SocketEventNamesAndTypes,
} from '@thebcms/selfhosted-backend/socket/events/main';
import { createQueue, QueueError } from '@thebcms/selfhosted-utils/queue';
import type { Client } from '@thebcms/selfhosted-client/main';

export interface SocketEventHandler<
    Name extends SocketEventName,
    AdditionalData = undefined,
> {
    (
        data: SocketEventNamesAndTypes[Name],
        additionalData: AdditionalData,
    ): Promise<void>;
}

export interface SocketInternalEventSub {
    id: string;
    handler(): Promise<void>;
}

export class SocketHandler {
    id: string | null = null;
    socket: WebSocket = null as never;
    connected = false;
    subs: {
        [name: string]: Array<{
            id: string;
            handler: SocketEventHandler<any>;
        }>;
    } = {};

    private tryReconnectIn = 1000;
    private readonly maxReconnectTime = 60000;
    private disconnected = false;
    private internalEventSubs: {
        open: SocketInternalEventSub[];
        close: SocketInternalEventSub[];
    } = {
        open: [],
        close: [],
    };
    private connectionQueue = createQueue<void>();
    private debugIgnoreEventNames: SocketEventName[] = [
        'entry_sync_mouse_move',
        'entry_sync_prose_cursor_update',
    ];

    constructor(private client: Client) {
        this.subs.all = [];
        this.register('socket_connection', async (d) => {
            const data = d as SocketEventDataConnection;
            this.id = data.id;
        });
    }

    clear(): void {
        // Do nothing
        if (this.socket) {
            this.socket.close();
        }
    }

    async connect() {
        const queue = await this.connectionQueue({
            name: 'Connection',
            handler: async () => {
                if (!this.connected && !this.disconnected) {
                    this.id = null;
                    await new Promise<void>((resolve, reject) => {
                        this.socket = new WebSocket(
                            this.client.cmsOrigin
                                ? `${
                                      this.client.cmsOrigin.startsWith('https')
                                          ? 'wss'
                                          : 'ws'
                                  }://${
                                      this.client.cmsOrigin.split('://')[1]
                                  }/api/v4/socket?token=apikey_${this.client.apiKeyInfo.id}.${this.client.apiKeyInfo.secret}`
                                : `${
                                      window.location.host.includes(':8080')
                                          ? 'ws'
                                          : 'wss'
                                  }://${window.location.host}/api/v4/socket?token=apikey_${this.client.apiKeyInfo.id}.${this.client.apiKeyInfo.secret}`,
                        );
                        this.socket.addEventListener('open', async () => {
                            this.tryReconnectIn = 1000;
                            this.connected = true;
                            for (
                                let i = 0;
                                i < this.internalEventSubs.open.length;
                                i++
                            ) {
                                await this.internalEventSubs.open[i].handler();
                            }
                            resolve();
                        });
                        this.socket.addEventListener('close', async () => {
                            this.connected = false;
                            for (
                                let i = 0;
                                i < this.internalEventSubs.close.length;
                                i++
                            ) {
                                await this.internalEventSubs.open[i].handler();
                            }
                            setTimeout(async () => {
                                this.tryReconnectIn = this.tryReconnectIn * 2;
                                if (
                                    this.tryReconnectIn > this.maxReconnectTime
                                ) {
                                    this.tryReconnectIn = this.maxReconnectTime;
                                }
                                await this.connect();
                            }, this.tryReconnectIn);
                        });
                        this.socket.addEventListener('error', async (event) => {
                            console.error('Connection error', event);
                            for (
                                let i = 0;
                                i < this.internalEventSubs.close.length;
                                i++
                            ) {
                                await this.internalEventSubs.open[i].handler();
                            }
                            reject(event);
                        });
                        this.socket.addEventListener(
                            'message',
                            async (event) => {
                                try {
                                    const data: {
                                        en: SocketEventName;
                                        ed: SocketEventData;
                                    } = JSON.parse(event.data as string);
                                    if (this.shouldDebug()) {
                                        this.debug('receive', data.en, data.ed);
                                    }
                                    if (this.subs[data.en]) {
                                        for (
                                            let i = 0;
                                            i < this.subs[data.en].length;
                                            i++
                                        ) {
                                            const sub = this.subs[data.en][i];
                                            await sub.handler(
                                                data.ed,
                                                undefined,
                                            );
                                        }
                                    }
                                    for (
                                        let i = 0;
                                        i < this.subs.all.length;
                                        i++
                                    ) {
                                        const sub = this.subs.all[i];
                                        await sub.handler(data.ed, undefined);
                                    }
                                } catch (error) {
                                    console.error(
                                        'Invalid message from server',
                                        event.data,
                                    );
                                    console.error(error);
                                }
                            },
                        );
                    });
                }
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
    }

    register<Name extends SocketEventName>(
        eventName: Name,
        handler: SocketEventHandler<Name>,
    ): () => void {
        const id = uuidv4();
        if (!this.subs[eventName]) {
            this.subs[eventName] = [];
        }

        this.subs[eventName].push({
            id,
            handler: async (data) => {
                try {
                    await handler(data, undefined);
                } catch (error) {
                    console.error('Failed to execute socket handler', {
                        eventName,
                        error,
                    });
                }
            },
        });
        // this.subs[eventName].push({ id, handler });
        return () => {
            for (let i = 0; i < this.subs[eventName].length; i++) {
                const sub = this.subs[eventName][i];
                if (sub.id === id) {
                    this.subs[eventName].splice(i, 1);
                    break;
                }
            }
        };
    }

    internalEventRegister(
        type: 'open' | 'close',
        handler: () => Promise<void>,
    ): () => void {
        const id = uuidv4();
        this.internalEventSubs[type].push({ id, handler });
        if (type === 'open' && this.id) {
            handler().catch((err) => console.error(err));
        }
        if (type === 'close' && !this.id) {
            handler().catch((err) => console.error(err));
        }
        return () => {
            for (let i = 0; i < this.internalEventSubs[type].length; i++) {
                if (this.internalEventSubs[type][i].id === id) {
                    this.internalEventSubs[type].splice(i, 1);
                    break;
                }
            }
        };
    }

    emit<Name extends SocketEventName>(
        eventName: Name,
        data: SocketEventNamesAndTypes[Name],
    ) {
        if (this.socket && this.connected) {
            if (this.shouldDebug()) {
                this.debug('emit', eventName, data);
            }
            this.socket.send(JSON.stringify({ en: eventName, ed: data }));
        }
    }

    private debug(
        type: 'emit' | 'receive',
        eventName: SocketEventName,
        eventData: unknown,
    ) {
        if (!this.debugIgnoreEventNames.includes(eventName)) {
            console.debug(
                `%c[socket] %c(${type}) %c${eventName} %c-> data: `,
                'color: #5577ff;',
                'color: current;',
                'color: #44ff77',
                'color: current',
                eventData,
            );
        }
    }

    private shouldDebug(): boolean {
        return this.client.debug;
    }

    disconnect() {
        if (this.socket) {
            this.disconnected = true;
            this.socket.close();
            this.socket.terminate();
            setTimeout(() => {
                this.disconnected = false;
            }, 1000);
        }
    }
}
