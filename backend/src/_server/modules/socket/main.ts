import crypto from 'crypto';
import webSocket, { type WebSocket } from '@fastify/websocket';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IncomingMessage } from 'http';

import type { Module } from '@thebcms/selfhosted-backend/server/module';
import { Logger } from '@thebcms/selfhosted-backend/server/logger';
import { defaultHttpErrorHandler } from '@thebcms/selfhosted-backend/server/http-error';

export interface SocketConnection {
    id: string;
    channels: string[];
    metadata?: unknown;
    socket: WebSocket;
    emit(eventName: string, eventData: unknown): void;
}

export class SocketManager {
    static conns: {
        [id: string]: SocketConnection;
    } = {};

    static channelEmit<Data = unknown>(
        channels: string[],
        eventName: string,
        eventData: Data,
        excludeConnections?: string[],
    ): void {
        if (!excludeConnections) {
            excludeConnections = [];
        }
        Object.keys(SocketManager.conns).forEach((id) => {
            const conn = SocketManager.conns[id];
            if (!(excludeConnections as string[]).includes(id)) {
                let found = false;
                for (let i = 0; i < channels.length; i++) {
                    const channel = channels[i];
                    if (conn.channels.includes(channel)) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    conn.emit(eventName, eventData);
                }
            }
        });
    }
}

export interface SocketEvent {
    id: string;
    eventName: string;
    eventData: unknown;
}

export interface SocketEventHandler<Data = unknown> {
    (data: Data, connection: SocketConnection): Promise<void> | void;
}

export interface SocketConfig {
    path: string;
    maxPayload?: number;
    eventHandlers?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [eventName: string]: SocketEventHandler<any>;
    };
    errorHandler?(
        err: unknown,
        connection: WebSocket,
        req: FastifyRequest,
        replay: FastifyReply,
    ): Promise<void> | void;
    validateConnection?(
        info: {
            origin: string;
            secure: boolean;
            req: IncomingMessage;
        },
        next: (ok: boolean) => void,
    ): Promise<void> | void;
    onConnection?(
        connection: SocketConnection,
        request: FastifyRequest,
    ): Promise<void> | void;
    onDisconnect?(connection: SocketConnection): Promise<void> | void;
    onMessage?(message: Buffer): Promise<void> | void;
}

export function createSocket(config: SocketConfig): Module {
    return {
        name: 'Socket',
        initialize({ next, fastify, name }) {
            const logger = new Logger(name);
            async function init() {
                if (!config.errorHandler) {
                    config.errorHandler = (err, _conn, req, replay) => {
                        defaultHttpErrorHandler(err, req, replay, logger);
                    };
                }
                await fastify.register(webSocket, {
                    errorHandler: config.errorHandler,
                    options: {
                        maxPayload: config.maxPayload,
                        verifyClient: config.validateConnection,
                    },
                });
                await fastify.register(async () => {
                    fastify.get(
                        config.path,
                        { websocket: true },
                        async (socket, req) => {
                            const id = crypto
                                .createHash('sha1')
                                .update(
                                    Date.now() +
                                        crypto
                                            .randomBytes(8)
                                            .toString('base64'),
                                )
                                .digest('hex');
                            SocketManager.conns[id] = {
                                id,
                                channels: [],
                                socket: socket,
                                emit(eventName, eventData) {
                                    socket.send(
                                        JSON.stringify({
                                            en: eventName,
                                            ed: eventData,
                                        }),
                                    );
                                },
                            };
                            logger.info('', `New socket connection "${id}"`);
                            if (config.onConnection) {
                                await config.onConnection(
                                    SocketManager.conns[id],
                                    req,
                                );
                            }
                            socket.on('message', async (message: Buffer) => {
                                const msg = message.toString();
                                try {
                                    const data = JSON.parse(msg);
                                    if (
                                        data.en &&
                                        data.ed &&
                                        config.eventHandlers &&
                                        config.eventHandlers[data.en]
                                    ) {
                                        await config.eventHandlers[data.en](
                                            data.ed,
                                            SocketManager.conns[id],
                                        );
                                    }
                                } catch (error) {
                                    logger.warn(id, error);
                                }
                            });
                            socket.on('close', async () => {
                                if (config.onDisconnect) {
                                    await config.onDisconnect(
                                        SocketManager.conns[id],
                                    );
                                }
                                logger.info('', `Socket disconnected "${id}"`);
                                delete SocketManager.conns[id];
                            });
                        },
                    );
                });
            }
            init()
                .then(() => next())
                .catch((err) => next(err));
        },
    };
}
