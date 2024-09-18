import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'isomorphic-ws';
import { Handler } from '@bcms/selfhosted-sdk/handlers/_handler';
import { createQueue, QueueError } from '@bcms/selfhosted-utils/queue';
import { Sdk } from '@bcms/selfhosted-sdk';
import type {
    SocketEventData,
    SocketEventDataConnection,
    SocketEventName,
    SocketEventNamesAndTypes,
} from '@bcms/selfhosted-backend/socket/events/main';

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

/**
 * Class for handling socket connection.
 */
export class SocketHandler extends Handler {
    /**
     * ID of the currently connected socket
     */
    id: string | null = null;
    /**
     * Socket connection itself
     */
    socket: WebSocket = null as never;
    /**
     * Is connected to the socket server
     */
    connected = false;

    private subs: {
        [name: string]: Array<{
            id: string;
            handler: SocketEventHandler<any>;
        }>;
    } = {};
    private tryReconnectIn = 1000;
    private readonly maxReconnectTime = 60000;
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

    constructor(private sdk: Sdk) {
        super();
        this.subs.all = [];
        this.register('socket_connection', async (d) => {
            const data = d as SocketEventDataConnection;
            this.id = data.id;
        });
    }

    /**
     * Close socket if it is opened
     */
    clear(): void {
        if (this.socket) {
            this.socket.close();
        }
    }

    private getUrl() {
        const protocol = this.sdk.config.apiOrigin.startsWith('https')
            ? 'wss'
            : 'ws';
        return `${protocol}://${
            this.sdk.config.apiOrigin.split('://')[1]
        }/api/v4/socket?token=${this.sdk.accessTokenRaw}`;
    }

    /**
     * Connect to the socket server
     */
    async connect() {
        const queue = await this.connectionQueue({
            name: 'Connection',
            handler: async () => {
                if (!this.connected) {
                    this.id = null;
                    await new Promise<void>((resolve, reject) => {
                        this.sdk.refreshAccessToken().then((result) => {
                            if (result) {
                                this.socket = new WebSocket(
                                    // `${
                                    //     window.location.host.includes(':8080')
                                    //         ? 'ws'
                                    //         : 'wss'
                                    // }://${
                                    //     window.location.host
                                    // }/api/v4/socket?token=${
                                    //     this.sdk.accessTokenRaw
                                    // }`,
                                    this.getUrl(),
                                );
                                this.socket.addEventListener(
                                    'open',
                                    async () => {
                                        this.tryReconnectIn = 1000;
                                        this.connected = true;
                                        for (
                                            let i = 0;
                                            i <
                                            this.internalEventSubs.open.length;
                                            i++
                                        ) {
                                            await this.internalEventSubs.open[
                                                i
                                            ].handler();
                                        }
                                        resolve();
                                    },
                                );
                                this.socket.addEventListener(
                                    'close',
                                    async () => {
                                        this.connected = false;
                                        for (
                                            let i = 0;
                                            i <
                                            this.internalEventSubs.close.length;
                                            i++
                                        ) {
                                            await this.internalEventSubs.open[
                                                i
                                            ].handler();
                                        }
                                        setTimeout(async () => {
                                            this.tryReconnectIn =
                                                this.tryReconnectIn * 2;
                                            if (
                                                this.tryReconnectIn >
                                                this.maxReconnectTime
                                            ) {
                                                this.tryReconnectIn =
                                                    this.maxReconnectTime;
                                            }
                                            await this.connect();
                                        }, this.tryReconnectIn);
                                    },
                                );
                                this.socket.addEventListener(
                                    'error',
                                    async (event) => {
                                        console.error(
                                            'Connection error',
                                            event,
                                        );
                                        for (
                                            let i = 0;
                                            i <
                                            this.internalEventSubs.close.length;
                                            i++
                                        ) {
                                            await this.internalEventSubs.open[
                                                i
                                            ].handler();
                                        }
                                        reject(event);
                                    },
                                );
                                this.socket.addEventListener(
                                    'message',
                                    async (event) => {
                                        try {
                                            const data: {
                                                en: SocketEventName;
                                                ed: SocketEventData;
                                            } = JSON.parse(
                                                event.data as string,
                                            );
                                            if (this.shouldDebug()) {
                                                this.debug(
                                                    'receive',
                                                    data.en,
                                                    data.ed,
                                                );
                                            }
                                            if (this.subs[data.en]) {
                                                for (
                                                    let i = 0;
                                                    i <
                                                    this.subs[data.en].length;
                                                    i++
                                                ) {
                                                    const sub =
                                                        this.subs[data.en][i];
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
                                                await sub.handler(
                                                    data.ed,
                                                    undefined,
                                                );
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
                            }
                        });
                    });
                }
            },
        }).wait;
        if (queue instanceof QueueError) {
            throw queue.error;
        }
    }

    /**
     * Register to socket event. Handler function will be called
     * every time that specified event is emitted by the server.
     */
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

    /**
     * Register to internal socket events
     */
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

    /**
     * Emit event to the socket server
     */
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
        return !!(
            this.sdk.config &&
            this.sdk.config.debug &&
            (this.sdk.config.debug.includes('socket') ||
                this.sdk.config.debug.includes('all'))
        );
    }
}
