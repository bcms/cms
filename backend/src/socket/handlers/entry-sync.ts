import { SocketManager } from '@thebcms/selfhosted-backend/server/modules/socket';
import { createSocketEventHandler } from '@thebcms/selfhosted-backend/socket/handlers/_wrapper';
import type {
    SocketEventName,
    SocketEventNamesAndTypes,
} from '@thebcms/selfhosted-backend/socket/events/main';
import {
    type SocketEventDataEntrySyncBooleanUpdate,
    SocketEventDataEntrySyncBooleanUpdateSchema,
    type SocketEventDataEntrySyncContentResponse,
    type SocketEventDataEntrySyncDateUpdate,
    SocketEventDataEntrySyncDateUpdateSchema,
    type SocketEventDataEntrySyncDefaults,
    SocketEventDataEntrySyncDefaultsSchema,
    type SocketEventDataEntrySyncEntryPointerUpdate,
    SocketEventDataEntrySyncEntryPointerUpdateSchema,
    type SocketEventDataEntrySyncEnumUpdate,
    SocketEventDataEntrySyncEnumUpdateSchema,
    type SocketEventDataEntrySyncFocus,
    SocketEventDataEntrySyncFocusSchema,
    type SocketEventDataEntrySyncGroupPointerUpdate,
    SocketEventDataEntrySyncGroupPointerUpdateSchema,
    type SocketEventDataEntrySyncMediaUpdate,
    SocketEventDataEntrySyncMediaUpdateSchema,
    type SocketEventDataEntrySyncMouseMove,
    SocketEventDataEntrySyncMouseMoveSchema,
    type SocketEventDataEntrySyncNumberUpdate,
    SocketEventDataEntrySyncNumberUpdateSchema,
    type SocketEventDataEntrySyncProseContentUpdate,
    SocketEventDataEntrySyncProseContentUpdateSchema,
    type SocketEventDataEntrySyncProseCursorUpdate,
    SocketEventDataEntrySyncProseCursorUpdateSchema,
    type SocketEventDataEntrySyncRichTextUpdate,
    SocketEventDataEntrySyncRichTextUpdateSchema,
    type SocketEventDataEntrySyncStringUpdate,
    SocketEventDataEntrySyncStringUpdateSchema,
    type SocketEventDataEntrySyncUserJoin,
    SocketEventDataEntrySyncUserJoinSchema,
    type SocketEventDataEntrySyncUserLeave,
    SocketEventDataEntrySyncUserLeaveSchema,
    type SocketEventDataEntrySyncUserSelectRange,
    SocketEventDataEntrySyncUserSelectRangeSchema,
    type SocketEventDataEntrySyncYSyncReq,
    SocketEventDataEntrySyncYSyncReqSchema,
    type SocketEventDataEntrySyncYSyncRes,
    SocketEventDataEntrySyncYSyncResSchema,
    type SocketEventNamesEntrySync,
} from '@thebcms/selfhosted-backend/socket/events/entry-sync';
import { useEntrySyncChannelHandler } from '@thebcms/selfhosted-backend/entry-sync/channel-handler';

function emit<Name extends SocketEventName>(
    eventName: Name,
    data: SocketEventNamesAndTypes[Name],
    connections: string[],
    excludeConnection?: string,
) {
    if (excludeConnection) {
        for (let i = 0; i < connections.length; i++) {
            const conn = connections[i];
            if (conn !== excludeConnection) {
                if (SocketManager.conns[conn]) {
                    SocketManager.conns[conn].emit(eventName, data);
                }
            }
        }
    } else {
        for (let i = 0; i < connections.length; i++) {
            const conn = connections[i];
            if (SocketManager.conns[conn]) {
                SocketManager.conns[conn].emit(eventName, data);
            }
        }
    }
}

async function pipeEvent<Name extends keyof SocketEventNamesEntrySync>(
    eventName: Name,
    data: SocketEventNamesEntrySync[Name],
    connId: string,
) {
    const chan = useEntrySyncChannelHandler();
    const connIds = await chan.getConnectionIds(data.entryId);
    emit(eventName, data as SocketEventNamesAndTypes[Name], connIds, connId);
}

export const socketEventHandlersEntrySync = {
    entry_sync_open: createSocketEventHandler<SocketEventDataEntrySyncDefaults>(
        SocketEventDataEntrySyncDefaultsSchema,
        async (data, conn) => {
            const chan = useEntrySyncChannelHandler();
            const existingConn = chan.getConnection(
                data.entryId,
                conn.id,
                conn.channels[0],
            );
            if (existingConn) {
                const valueInfo = chan.getConnectionInfoFromValue(existingConn);
                chan.addConnection(
                    data.entryId,
                    conn.id,
                    conn.channels[0],
                    valueInfo.age,
                );
            } else {
                chan.addConnection(
                    data.entryId,
                    conn.id,
                    conn.channels[0],
                    Date.now(),
                );
            }
        },
    ),

    entry_sync_user_join:
        createSocketEventHandler<SocketEventDataEntrySyncUserJoin>(
            SocketEventDataEntrySyncUserJoinSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                const chan = useEntrySyncChannelHandler();
                const connKeys = await chan.getConnectionKeys(data.entryId);
                const userIds: string[] = [];
                const connIds: string[] = [];
                for (let i = 0; i < connKeys.length; i++) {
                    const connKey = connKeys[i];
                    const connInfo = chan.getConnectionInfoFromKey(connKey);
                    userIds.push(connInfo.userId);
                    connIds.push(connInfo.connId);
                }
                emit(
                    'entry_sync_users',
                    {
                        entryId: data.entryId,
                        lngCode: data.lngCode,
                        lngIdx: data.lngIdx,
                        sourceConnId: conn.id,
                        items: userIds
                            .filter((_, i) => !!SocketManager.conns[connIds[i]])
                            .map((userId, i) => {
                                return {
                                    userId,
                                    connId: connIds[i],
                                };
                            }),
                    },
                    [conn.id],
                );
                emit('entry_sync_user_join', data, connIds, conn.id);
            },
        ),

    entry_sync_user_leave:
        createSocketEventHandler<SocketEventDataEntrySyncUserLeave>(
            SocketEventDataEntrySyncUserLeaveSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                console.log('User leave:', conn.id);
                const chan = useEntrySyncChannelHandler();
                const conns = await chan.getConnectionIds(data.entryId);
                await chan.removeConnection(data.entryId, conn.id, data.userId);
                emit('entry_sync_user_leave', data, conns, conn.id);
            },
        ),

    entry_sync_focus: createSocketEventHandler<SocketEventDataEntrySyncFocus>(
        SocketEventDataEntrySyncFocusSchema,
        async (data, conn) => {
            data.sourceConnId = conn.id;
            await pipeEvent('entry_sync_focus', data, conn.id);
        },
    ),

    entry_sync_mouse_move:
        createSocketEventHandler<SocketEventDataEntrySyncMouseMove>(
            SocketEventDataEntrySyncMouseMoveSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_mouse_move', data, conn.id);
            },
        ),

    entry_sync_prose_content_update:
        createSocketEventHandler<SocketEventDataEntrySyncProseContentUpdate>(
            SocketEventDataEntrySyncProseContentUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent(
                    'entry_sync_prose_content_update',
                    data,
                    conn.id,
                );
            },
        ),

    entry_sync_prose_cursor_update:
        createSocketEventHandler<SocketEventDataEntrySyncProseCursorUpdate>(
            SocketEventDataEntrySyncProseCursorUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent(
                    'entry_sync_prose_cursor_update',
                    data,
                    conn.id,
                );
            },
        ),

    entry_sync_y_sync_req:
        createSocketEventHandler<SocketEventDataEntrySyncYSyncReq>(
            SocketEventDataEntrySyncYSyncReqSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                const chan = useEntrySyncChannelHandler();
                const conns = (
                    await chan.getConnectionsInfo(data.entryId)
                ).sort((a, b) => a.value.age - b.value.age);
                let emitTo: string | null = null;
                for (let i = 0; i < conns.length; i++) {
                    if (conns[i].key.connId !== conn.id) {
                        emitTo = conns[i].key.connId;
                        break;
                    }
                }
                if (emitTo && SocketManager.conns[emitTo]) {
                    emit('entry_sync_y_sync_req', data, [emitTo]);
                } else {
                    /**
                     * There are no older clients on this channel therefore there is
                     * nothing to sync.
                     */
                    emit(
                        'entry_sync_y_sync_res',
                        {
                            entryId: data.entryId,
                            sourceConnId: conn.id,
                            lngIdx: data.lngIdx,
                            lngCode: data.lngCode,
                            shouldSync: false,
                            updates: [],
                            propPath: data.propPath,
                        },
                        [conn.id],
                    );
                }
            },
        ),

    entry_sync_y_sync_res:
        createSocketEventHandler<SocketEventDataEntrySyncYSyncRes>(
            SocketEventDataEntrySyncYSyncResSchema,
            async (data) => {
                emit('entry_sync_y_sync_res', data, [data.sourceConnId]);
            },
        ),

    entry_sync_content_req:
        createSocketEventHandler<SocketEventDataEntrySyncDefaults>(
            SocketEventDataEntrySyncDefaultsSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                const chan = useEntrySyncChannelHandler();
                const conns = (
                    await chan.getConnectionsInfo(data.entryId)
                ).sort((a, b) => a.value.age - b.value.age);
                let emitTo: string | null = null;
                for (let i = 0; i < conns.length; i++) {
                    if (conns[i].key.connId !== conn.id) {
                        emitTo = conns[i].key.connId;
                        break;
                    }
                }
                if (emitTo && SocketManager.conns[emitTo]) {
                    emit('entry_sync_content_req', data, [emitTo]);
                } else {
                    /**
                     * There are no older clients on this channel therefore there is
                     * nothing to sync.
                     */
                    emit(
                        'entry_sync_content_res',
                        {
                            entryId: data.entryId,
                            sourceConnId: conn.id,
                            lngIdx: data.lngIdx,
                            lngCode: data.lngCode,
                            shouldSync: false,
                        },
                        [conn.id],
                    );
                }
            },
        ),

    entry_sync_content_res:
        createSocketEventHandler<SocketEventDataEntrySyncContentResponse>(
            SocketEventDataEntrySyncDefaultsSchema,
            async (data) => {
                emit('entry_sync_content_res', data, [data.sourceConnId]);
            },
        ),

    entry_sync_string_update:
        createSocketEventHandler<SocketEventDataEntrySyncStringUpdate>(
            SocketEventDataEntrySyncStringUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                console.log('String:', data);
                await pipeEvent('entry_sync_string_update', data, conn.id);
            },
        ),

    entry_sync_number_update:
        createSocketEventHandler<SocketEventDataEntrySyncNumberUpdate>(
            SocketEventDataEntrySyncNumberUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_number_update', data, conn.id);
            },
        ),

    entry_sync_bool_update:
        createSocketEventHandler<SocketEventDataEntrySyncBooleanUpdate>(
            SocketEventDataEntrySyncBooleanUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_bool_update', data, conn.id);
            },
        ),

    entry_sync_date_update:
        createSocketEventHandler<SocketEventDataEntrySyncDateUpdate>(
            SocketEventDataEntrySyncDateUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_date_update', data, conn.id);
            },
        ),

    entry_sync_enum_update:
        createSocketEventHandler<SocketEventDataEntrySyncEnumUpdate>(
            SocketEventDataEntrySyncEnumUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_enum_update', data, conn.id);
            },
        ),

    entry_sync_media_update:
        createSocketEventHandler<SocketEventDataEntrySyncMediaUpdate>(
            SocketEventDataEntrySyncMediaUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_media_update', data, conn.id);
            },
        ),

    entry_sync_entry_pointer_update:
        createSocketEventHandler<SocketEventDataEntrySyncEntryPointerUpdate>(
            SocketEventDataEntrySyncEntryPointerUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent(
                    'entry_sync_entry_pointer_update',
                    data,
                    conn.id,
                );
            },
        ),

    entry_sync_group_pointer_update:
        createSocketEventHandler<SocketEventDataEntrySyncGroupPointerUpdate>(
            SocketEventDataEntrySyncGroupPointerUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent(
                    'entry_sync_group_pointer_update',
                    data,
                    conn.id,
                );
            },
        ),

    entry_sync_rich_text_update:
        createSocketEventHandler<SocketEventDataEntrySyncRichTextUpdate>(
            SocketEventDataEntrySyncRichTextUpdateSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                await pipeEvent('entry_sync_rich_text_update', data, conn.id);
            },
        ),

    entry_sync_user_select_range:
        createSocketEventHandler<SocketEventDataEntrySyncUserSelectRange>(
            SocketEventDataEntrySyncUserSelectRangeSchema,
            async (data, conn) => {
                data.sourceConnId = conn.id;
                data.userId = conn.channels[0];
                await pipeEvent('entry_sync_user_select_range', data, conn.id);
            },
        ),
};
