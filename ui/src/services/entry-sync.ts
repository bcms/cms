import { ref } from 'vue';
import type {
    SocketEventDataEntrySyncBooleanUpdate,
    SocketEventDataEntrySyncDateUpdate,
    SocketEventDataEntrySyncDefaults,
    SocketEventDataEntrySyncEntryPointerUpdate,
    SocketEventDataEntrySyncEnumUpdate,
    SocketEventDataEntrySyncFocus,
    SocketEventDataEntrySyncGroupPointerUpdate,
    SocketEventDataEntrySyncMediaUpdate,
    SocketEventDataEntrySyncMouseMove,
    SocketEventDataEntrySyncNumberUpdate,
    SocketEventDataEntrySyncProseContentUpdate,
    SocketEventDataEntrySyncProseCursorUpdate,
    SocketEventDataEntrySyncRichTextUpdate,
    SocketEventDataEntrySyncStringUpdate,
    SocketEventDataEntrySyncStringUpdateChange,
    SocketEventDataEntrySyncUpdateDefaults,
    SocketEventDataEntrySyncUserSelectRange,
    SocketEventDataEntrySyncYSyncReq,
    SocketEventDataEntrySyncYSyncRes,
} from '@bcms/selfhosted-backend/socket/events/entry-sync';
import type { Sdk } from '@thebcms/selfhosted-sdk';
import type { Entry } from '@bcms/selfhosted-backend/entry/models/main';
import type { Throwable } from '@bcms/selfhosted-ui/util/throwable';
import type { SocketEventHandler } from '@thebcms/selfhosted-sdk/handlers/socket';
import type { PropValueDateData } from '@bcms/selfhosted-backend/prop/models/date';
import type { PropValueMediaData } from '@bcms/selfhosted-backend/prop/models/media';
import type { PropValueEntryPointer } from '@bcms/selfhosted-backend/prop/models/entry-pointer';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import { callAndClearUnsubscribeFns } from '@bcms/selfhosted-ui/util/sub';

export interface EntrySyncUserDataColor {
    main: string;
}

export interface EntrySyncUserData {
    connId: string;
    userId: string;
    color: EntrySyncUserDataColor;
    /**
     * Value of -1 should be ignored. That means that data
     * is not yet available.
     */
    mouse: {
        x: number;
        y: number;
    };
    /**
     * Value of -1 should be ignored. That means that data
     * is not yet available.
     */
    scroll: {
        y: number;
    };
    /**
     * Will contain a prop path. This can be used to target
     * node in the DOM.
     */
    focusOn?: string;
}

const userColors: EntrySyncUserDataColor[] = [
    {
        main: '#ff0000',
    },
    {
        main: '#ffff00',
    },
    {
        main: '#ff00ff',
    },
    {
        main: '#00ff00',
    },
    {
        main: '#00ffff',
    },
    {
        main: '#0000ff',
    },
];

type UpdateDefaults = Omit<
    SocketEventDataEntrySyncUpdateDefaults,
    'entryId' | 'lngIdx' | 'lngCode' | 'sourceConnId'
>;

function fnWrapper(handler: any): (args: any) => void {
    return (args) => {
        handler(args);
    };
}

export class EntrySync {
    private sdk: Sdk;
    private throwable: Throwable;
    private unsubs: Array<() => void> = [];
    private tickerInterval = setInterval(() => {
        let emitMouseMove = false;
        if (
            this.mouse.position.curr.x !== this.mouse.position.last.x ||
            this.mouse.position.curr.y !== this.mouse.position.last.y
        ) {
            this.mouse.position.last.x = this.mouse.position.curr.x;
            this.mouse.position.last.y = this.mouse.position.curr.y;
            emitMouseMove = true;
        }
        if (this.scroll.y.curr !== this.scroll.y.last) {
            this.scroll.y.last = this.scroll.y.curr;
            emitMouseMove = true;
        }
        if (emitMouseMove) {
            this.emitMouseMove(
                this.mouse.position.curr.x,
                this.mouse.position.curr.y,
                this.scroll.y.curr,
            );
        }
    }, 20);
    private refreshConnectionInterval = setInterval(() => {
        const data: SocketEventDataEntrySyncDefaults = {
            entryId: this.getEntryId(),
            lngIdx: this.getLngIdx(),
            lngCode: this.getLngCode(),
            sourceConnId: '',
        };
        this.sdk.socket.emit('entry_sync_open', data);
    }, 60000);

    users = ref<EntrySyncUserData[]>([]);
    scroll: {
        y: {
            curr: number;
            last: number;
        };
    } = {
        y: {
            curr: 0,
            last: 0,
        },
    };
    mouse: {
        position: {
            curr: {
                x: number;
                y: number;
            };
            last: {
                x: number;
                y: number;
            };
        };
        click: {
            left: boolean;
        };
    } = {
        position: {
            curr: {
                x: 0,
                y: 0,
            },
            last: {
                x: 0,
                y: 0,
            },
        },
        click: {
            left: false,
        },
    };

    constructor(
        public getEntryId: () => string,
        public getEntry: () => Entry | undefined,
        public setEntry: (entry: Entry) => void,
        public getLngCode: () => string,
        public getLngIdx: () => number,
    ) {
        this.sdk = window.bcms.sdk;
        this.throwable = window.bcms.throwable;
        this.unsubs.push(
            this.sdk.socket.internalEventRegister('open', async () => {
                const data: SocketEventDataEntrySyncDefaults = {
                    entryId: this.getEntryId(),
                    lngIdx: this.getLngIdx(),
                    lngCode: this.getLngCode(),
                    sourceConnId: '',
                };
                this.sdk.socket.emit('entry_sync_open', data);
            }),
            this.sdk.socket.register('entry_sync_user_leave', async (data) => {
                if (data.entryId === this.getEntryId()) {
                    for (let i = 0; i < this.users.value.length; i++) {
                        const user = this.users.value[i];
                        if (user.connId === data.sourceConnId) {
                            this.users.value.splice(i, 1);
                            break;
                        }
                    }
                }
            }),
            this.sdk.socket.register('entry_sync_user_join', async (data) => {
                if (data.entryId === this.getEntryId()) {
                    if (
                        !this.users.value.find(
                            (e) => e.connId === data.sourceConnId,
                        )
                    ) {
                        const colorIdx =
                            this.users.value.length % userColors.length;
                        this.users.value.push({
                            connId: data.sourceConnId,
                            userId: data.userId,
                            color: userColors[colorIdx],
                            mouse: {
                                x: -1,
                                y: -1,
                            },
                            scroll: {
                                y: -1,
                            },
                        });
                    }
                }
            }),
            this.sdk.socket.register('entry_sync_users', async (data) => {
                if (data.entryId === this.getEntryId()) {
                    /**
                     * Prefetch all users of the instance. They will
                     * be pulled from cache if available.
                     */
                    await this.throwable(async () => {
                        await this.sdk.user.getAll();
                    });
                    const items = data.items.filter(
                        (e) => e.connId !== this.sdk.socket.id,
                    );
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        const existingUser = this.users.value.find(
                            (e) => e.connId === item.connId,
                        );
                        if (!existingUser) {
                            await this.throwable(async () => {
                                const user = await this.sdk.user.get(
                                    item.userId,
                                );
                                const colorIdx =
                                    this.users.value.length % userColors.length;
                                this.users.value.push({
                                    connId: item.connId,
                                    userId: user._id,
                                    color: userColors[colorIdx],
                                    scroll: {
                                        y: -1,
                                    },
                                    mouse: {
                                        x: -1,
                                        y: -1,
                                    },
                                });
                            });
                        }
                    }
                }
            }),
            this.sdk.socket.register('entry_sync_mouse_move', async (data) => {
                if (data.entryId === this.getEntryId()) {
                    const user = this.users.value.find(
                        (e) => e.connId === data.sourceConnId,
                    );
                    if (user) {
                        user.mouse.x = data.x;
                        user.mouse.y = data.y;
                        user.scroll.y = data.scrollY;
                    }
                }
            }),
            this.sdk.socket.register('entry_sync_focus', async (data) => {
                if (data.entryId === this.getEntryId()) {
                    const user = this.users.value.find(
                        (e) => e.connId === data.sourceConnId,
                    );
                    if (user) {
                        user.focusOn =
                            data.propPath === '__none'
                                ? undefined
                                : data.propPath;
                    }
                }
            }),
            this.sdk.socket.register('entry_sync_content_req', async (data) => {
                if (data.entryId === this.getEntryId()) {
                    this.sdk.socket.emit('entry_sync_content_res', {
                        entryId: this.getEntryId(),
                        lngCode: this.getLngCode(),
                        lngIdx: this.getLngIdx(),
                        sourceConnId: data.sourceConnId,
                        shouldSync: true,
                        data: this.getEntry(),
                    });
                }
            }),
        );
    }

    private onMouseMove(event: MouseEvent) {
        this.mouse.position.curr.x = event.clientX;
        this.mouse.position.curr.y = event.clientY;
    }

    private onScroll() {
        this.scroll.y.curr = document.body.scrollTop;
        const scrollDelta = this.scroll.y.curr - this.scroll.y.last;
        this.scroll.y.last = document.body.scrollTop;
        this.mouse.position.curr.y = this.mouse.position.curr.y + scrollDelta;
    }

    private findPropPath(element: HTMLElement): string | null {
        if (element.id && element.id.startsWith('entry.')) {
            return element.id;
        } else if (element.parentElement) {
            return this.findPropPath(element.parentElement);
        }
        return null;
    }

    private onMouseClick(event: MouseEvent) {
        if (event.buttons === 1) {
            const propPath = this.findPropPath(event.target as HTMLElement);
            this.emitFocus(propPath || '__none');
            this.mouse.click.left = true;
        } else if (event.buttons === 0) {
            this.mouse.click.left = false;
        }
    }

    async sync() {
        this.sdk.socket.emit('entry_sync_user_join', {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            userId: this.sdk.accessToken?.payload.userId || '__none',
            sourceConnId: '',
        });
        await this.throwable(async () => {
            const mouseMove = fnWrapper((event: MouseEvent) => {
                this.onMouseMove(event);
            });
            const scroll = fnWrapper(() => {
                this.onScroll();
            });
            const mouseClick = fnWrapper((event: MouseEvent) => {
                this.onMouseClick(event);
            });
            window.addEventListener('mousemove', mouseMove);
            document.body.addEventListener('scroll', scroll);
            window.addEventListener('mousedown', mouseClick);
            window.addEventListener('mouseup', mouseClick);
            this.unsubs.push(() => {
                window.removeEventListener('mousemove', mouseMove);
                document.body.removeEventListener('scroll', scroll);
                window.removeEventListener('mousedown', mouseClick);
                window.removeEventListener('mouseup', mouseClick);
            });
            await new Promise<void>((resolve, reject) => {
                const resUnsub = this.sdk.socket.register(
                    'entry_sync_content_res',
                    async (data) => {
                        if (data.entryId === this.getEntryId()) {
                            if (data.data && data.shouldSync) {
                                this.setEntry(data.data);
                            }
                            clearTimeout(timeout);
                            resUnsub();
                            resolve();
                        }
                    },
                );
                const timeout = setTimeout(() => {
                    resUnsub();
                    reject('Timeout while waiting for entry sync data');
                }, 3000);
                this.sdk.socket.emit('entry_sync_content_req', {
                    entryId: this.getEntryId(),
                    lngIdx: this.getLngIdx(),
                    lngCode: this.getLngCode(),
                    sourceConnId: '',
                });
            });
        });
    }

    emitFocus(propPath: string) {
        const data: SocketEventDataEntrySyncFocus = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath,
        };
        this.sdk.socket.emit('entry_sync_focus', data);
    }

    emitMouseMove(x: number, y: number, scrollY: number) {
        const data: SocketEventDataEntrySyncMouseMove = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            x,
            y,
            scrollY,
        };
        this.sdk.socket.emit('entry_sync_mouse_move', data);
    }

    emitProseContentUpdate(propPath: string, updates: number[]) {
        const data: SocketEventDataEntrySyncProseContentUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath,
            updates,
        };
        this.sdk.socket.emit('entry_sync_prose_content_update', data);
    }

    onProseContentUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_prose_content_update'>,
    ): () => void {
        return this.sdk.socket.register(
            'entry_sync_prose_content_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitProseCursorUpdate(propPath: string, updates: number[]) {
        const data: SocketEventDataEntrySyncProseCursorUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath,
            updates,
        };
        this.sdk.socket.emit('entry_sync_prose_cursor_update', data);
    }

    onProseCursorUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_prose_cursor_update'>,
    ): () => void {
        return this.sdk.socket.register(
            'entry_sync_prose_cursor_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitYSyncRequest(propPath: string) {
        const data: SocketEventDataEntrySyncYSyncReq = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath,
        };
        this.sdk.socket.emit('entry_sync_y_sync_req', data);
    }

    onYSyncRequest(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_y_sync_req'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_y_sync_req',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitYSyncResponse(
        propPath: string,
        connId: string,
        shouldSync: boolean,
        updates: number[],
    ) {
        const data: SocketEventDataEntrySyncYSyncRes = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: connId,
            shouldSync,
            updates,
            propPath,
        };
        this.sdk.socket.emit('entry_sync_y_sync_res', data);
    }

    onYSyncResponse(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_y_sync_res'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_y_sync_res',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitStringUpdate(
        event: UpdateDefaults & {
            changes?: SocketEventDataEntrySyncStringUpdateChange[];
        },
    ) {
        const data: SocketEventDataEntrySyncStringUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            changes: event.changes,
        };
        this.sdk.socket.emit('entry_sync_string_update', data);
    }

    onStringUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_string_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_string_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitNumberUpdate(
        event: UpdateDefaults & {
            value?: number;
        },
    ) {
        const data: SocketEventDataEntrySyncNumberUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            value: event.value,
        };
        this.sdk.socket.emit('entry_sync_number_update', data);
    }

    onNumberUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_number_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_number_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitBoolUpdate(
        event: UpdateDefaults & {
            value?: boolean;
        },
    ) {
        const data: SocketEventDataEntrySyncBooleanUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            value: event.value,
        };
        this.sdk.socket.emit('entry_sync_bool_update', data);
    }
    onBoolUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_bool_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_bool_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitDateUpdate(
        event: UpdateDefaults & {
            value?: PropValueDateData;
        },
    ) {
        const data: SocketEventDataEntrySyncDateUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            value: event.value,
        };
        this.sdk.socket.emit('entry_sync_date_update', data);
    }
    onDateUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_date_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_date_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitEnumUpdate(
        event: UpdateDefaults & {
            value?: string;
        },
    ) {
        const data: SocketEventDataEntrySyncEnumUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            value: event.value,
        };
        this.sdk.socket.emit('entry_sync_enum_update', data);
    }

    onEnumUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_enum_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_enum_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitMediaUpdate(
        event: UpdateDefaults & {
            value?: PropValueMediaData;
        },
    ) {
        const data: SocketEventDataEntrySyncMediaUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            value: event.value,
        };
        this.sdk.socket.emit('entry_sync_media_update', data);
    }

    onMediaUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_media_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_media_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitEntryPointerUpdate(
        event: UpdateDefaults & {
            value?: PropValueEntryPointer;
        },
    ) {
        const data: SocketEventDataEntrySyncEntryPointerUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
            value: event.value,
        };
        this.sdk.socket.emit('entry_sync_entry_pointer_update', data);
    }

    onEntryPointerUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_entry_pointer_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_entry_pointer_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitGroupPointerUpdate(event: UpdateDefaults) {
        const data: SocketEventDataEntrySyncGroupPointerUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
        };
        this.sdk.socket.emit('entry_sync_group_pointer_update', data);
    }

    onGroupPointerUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_group_pointer_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_group_pointer_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitRichTextUpdate(event: UpdateDefaults) {
        const data: SocketEventDataEntrySyncRichTextUpdate = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath: event.propPath,
            add: event.add,
            remove: event.remove,
            move: event.move,
        };
        this.sdk.socket.emit('entry_sync_rich_text_update', data);
    }

    onRichTextUpdate(
        propPath: string,
        handler: SocketEventHandler<'entry_sync_rich_text_update'>,
    ) {
        return this.sdk.socket.register(
            'entry_sync_rich_text_update',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await handler(data, undefined);
                }
            },
        );
    }

    emitUserSelectRange(propPath: string, range: [number, number]) {
        const data: SocketEventDataEntrySyncUserSelectRange = {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            sourceConnId: '',
            propPath,
            range,
            userId: (this.sdk.store.user.methods.me() as UserProtected)._id,
        };
        this.sdk.socket.emit('entry_sync_user_select_range', data);
    }

    onUserSelectRange(
        propPath: string,
        handler: SocketEventHandler<
            'entry_sync_user_select_range',
            { entrySyncUser: EntrySyncUserData; user: UserProtected }
        >,
    ) {
        return this.sdk.socket.register(
            'entry_sync_user_select_range',
            async (data) => {
                if (
                    data.entryId === this.getEntryId() &&
                    data.propPath === propPath
                ) {
                    await this.throwable(async () => {
                        const entrySyncUser = this.users.value.find(
                            (e) => e.connId === data.sourceConnId,
                        );
                        const user = (await this.sdk.user.get(
                            'me',
                        )) as UserProtected;
                        if (entrySyncUser && user) {
                            await handler(data, {
                                entrySyncUser,
                                user,
                            });
                        }
                    });
                }
            },
        );
    }

    destroy() {
        callAndClearUnsubscribeFns(this.unsubs);
        clearInterval(this.tickerInterval);
        clearInterval(this.refreshConnectionInterval);
        this.sdk.socket.emit('entry_sync_user_leave', {
            entryId: this.getEntryId(),
            lngCode: this.getLngCode(),
            lngIdx: this.getLngIdx(),
            userId: this.sdk.accessToken?.payload.userId || '__none',
            sourceConnId: '',
        });
    }
}
