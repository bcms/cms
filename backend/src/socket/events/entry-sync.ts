import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    type Entry,
    EntrySchema,
} from '@bcms/selfhosted-backend/entry/models/main';
import {
    type PropValueDateData,
    PropValueDateDataSchema,
} from '@bcms/selfhosted-backend/prop/models/date';
import {
    type PropValueMediaData,
    PropValueMediaDataSchema,
} from '@bcms/selfhosted-backend/prop/models/media';
import {
    type PropValueEntryPointer,
    PropValueEntryPointerSchema,
} from '@bcms/selfhosted-backend/prop/models/entry-pointer';

export interface SocketEventDataEntrySyncDefaults {
    entryId: string;
    lngIdx: number;
    lngCode: string;
    /**
     * This property is set on the server when pipping event
     * to other clients. Client can set empty string
     * as a value when emitting an event.
     */
    sourceConnId: string;
}

export const SocketEventDataEntrySyncDefaultsSchema: ObjectSchema = {
    entryId: {
        __type: 'string',
        __required: true,
    },
    lngIdx: {
        __type: 'number',
        __required: true,
    },
    lngCode: {
        __type: 'string',
        __required: true,
    },
    sourceConnId: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataEntrySyncFocus
    extends SocketEventDataEntrySyncDefaults {
    propPath: string | '__none';
}

export const SocketEventDataEntrySyncFocusSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    propPath: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataEntrySyncMouseMove
    extends SocketEventDataEntrySyncDefaults {
    scrollY: number;
    x: number;
    y: number;
}

export const SocketEventDataEntrySyncMouseMoveSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    scrollY: {
        __type: 'number',
        __required: true,
    },
    x: {
        __type: 'number',
        __required: true,
    },
    y: {
        __type: 'number',
        __required: true,
    },
};

export interface SocketEventDataEntrySyncUserJoin
    extends SocketEventDataEntrySyncDefaults {
    userId: string;
}

export const SocketEventDataEntrySyncUserJoinSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    userId: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataEntrySyncUserLeave
    extends SocketEventDataEntrySyncDefaults {
    userId: string;
}

export const SocketEventDataEntrySyncUserLeaveSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    userId: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataEntrySyncUsers
    extends SocketEventDataEntrySyncDefaults {
    items: Array<{
        userId: string;
        connId: string;
    }>;
}

export const SocketEventDataEntrySyncUsers: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    items: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'object',
            __content: {
                userId: {
                    __type: 'string',
                    __required: true,
                },
                connId: {
                    __type: 'string',
                    __required: true,
                },
            },
        },
    },
};

export interface SocketEventDataEntrySyncProseContentUpdate
    extends SocketEventDataEntrySyncDefaults {
    propPath: string;
    updates: number[];
}

export const SocketEventDataEntrySyncProseContentUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    propPath: {
        __type: 'string',
        __required: true,
    },
    updates: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'number',
        },
    },
};

export interface SocketEventDataEntrySyncProseCursorUpdate
    extends SocketEventDataEntrySyncDefaults {
    propPath: string;
    updates: number[];
}

export const SocketEventDataEntrySyncProseCursorUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    propPath: {
        __type: 'string',
        __required: true,
    },
    updates: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'number',
        },
    },
};

export interface SocketEventDataEntrySyncYSyncReq
    extends SocketEventDataEntrySyncDefaults {
    propPath: string;
}

export const SocketEventDataEntrySyncYSyncReqSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    propPath: {
        __type: 'string',
        __required: true,
    },
};

export interface SocketEventDataEntrySyncYSyncRes
    extends SocketEventDataEntrySyncDefaults {
    shouldSync: boolean;
    propPath: string;
    updates: number[];
}

export const SocketEventDataEntrySyncYSyncResSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    shouldSync: {
        __type: 'boolean',
        __required: true,
    },
    propPath: {
        __type: 'string',
        __required: true,
    },
    updates: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'number',
        },
    },
};

export interface SocketEventDataEntrySyncContentResponse
    extends SocketEventDataEntrySyncDefaults {
    shouldSync: boolean;
    data?: Entry;
}

export const SocketEventDataEntrySyncContentResponse: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    shouldSync: {
        __type: 'boolean',
        __required: true,
    },
    data: {
        __type: 'object',
        __required: false,
        __child: EntrySchema,
    },
};

export interface SocketEventDataEntrySyncStringUpdateChange {
    ai?: number; // Add char at index
    av?: string; // Add char value
    r?: number; // char_idx
}

export const SocketEventDataEntrySyncStringUpdateChangeSchema: ObjectSchema = {
    ai: {
        __type: 'number',
        __required: false,
    },
    av: {
        __type: 'string',
        __required: false,
    },
    r: {
        __type: 'number',
        __required: false,
    },
};

export interface SocketEventDataEntrySyncUpdateDefaults
    extends SocketEventDataEntrySyncDefaults {
    propPath: string;
    add?: boolean;
    remove?: number; // Date to remove index
    /**
     * 1. Item index (item which should be moved)
     * 2. Direction in which to move item and by how much
     */
    move?: [number, number];
}

export const SocketEventDataEntrySyncUpdateDefaultsSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    propPath: {
        __type: 'string',
        __required: true,
    },
    add: {
        __type: 'boolean',
        __required: false,
    },
    remove: {
        __type: 'number',
        __required: false,
    },
    move: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'number',
        },
    },
};

export interface SocketEventDataEntrySyncStringUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    changes?: SocketEventDataEntrySyncStringUpdateChange[];
}

export const SocketEventDataEntrySyncStringUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    changes: {
        __type: 'array',
        __required: false,
        __child: {
            __type: 'object',
            __content: SocketEventDataEntrySyncStringUpdateChangeSchema,
        },
    },
};

export interface SocketEventDataEntrySyncNumberUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    value?: number;
}

export const SocketEventDataEntrySyncNumberUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    value: {
        __type: 'number',
        __required: false,
    },
};

export interface SocketEventDataEntrySyncBooleanUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    value?: boolean;
}

export const SocketEventDataEntrySyncBooleanUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    value: {
        __type: 'boolean',
        __required: false,
    },
};

export interface SocketEventDataEntrySyncDateUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    value?: PropValueDateData;
}

export const SocketEventDataEntrySyncDateUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    value: {
        __type: 'object',
        __required: false,
        __child: PropValueDateDataSchema,
    },
};

export interface SocketEventDataEntrySyncEnumUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    value?: string;
}

export const SocketEventDataEntrySyncEnumUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    value: {
        __type: 'string',
        __required: false,
    },
};

export interface SocketEventDataEntrySyncMediaUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    value?: PropValueMediaData;
}

export const SocketEventDataEntrySyncMediaUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    value: {
        __type: 'object',
        __required: false,
        __child: PropValueMediaDataSchema,
    },
};

export interface SocketEventDataEntrySyncEntryPointerUpdate
    extends SocketEventDataEntrySyncUpdateDefaults {
    value?: PropValueEntryPointer;
}

export const SocketEventDataEntrySyncEntryPointerUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
    value: {
        __type: 'object',
        __required: false,
        __child: PropValueEntryPointerSchema,
    },
};

export type SocketEventDataEntrySyncGroupPointerUpdate =
    SocketEventDataEntrySyncUpdateDefaults;

export const SocketEventDataEntrySyncGroupPointerUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncUpdateDefaultsSchema,
};

export type SocketEventDataEntrySyncRichTextUpdate =
    SocketEventDataEntrySyncUpdateDefaults;

export const SocketEventDataEntrySyncRichTextUpdateSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
};

export interface SocketEventDataEntrySyncUserSelectRange
    extends SocketEventDataEntrySyncDefaults {
    propPath: string;
    /**
     * This property will be overwritten on server
     * when piping event to clients. User ID of
     * current connection will be set in this property.
     */
    userId: string;
    range: [number, number];
}

export const SocketEventDataEntrySyncUserSelectRangeSchema: ObjectSchema = {
    ...SocketEventDataEntrySyncDefaultsSchema,
    propPath: {
        __type: 'string',
        __required: true,
    },
    userId: {
        __type: 'string',
        __required: true,
    },
    range: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'number',
        },
    },
};

export type SocketEventNamesEntrySync = {
    entry_sync_focus: SocketEventDataEntrySyncFocus;
    entry_sync_mouse_move: SocketEventDataEntrySyncMouseMove;
    entry_sync_open: SocketEventDataEntrySyncDefaults;
    entry_sync_user_join: SocketEventDataEntrySyncUserJoin;
    entry_sync_user_leave: SocketEventDataEntrySyncUserLeave;
    entry_sync_users: SocketEventDataEntrySyncUsers;
    entry_sync_prose_content_update: SocketEventDataEntrySyncProseContentUpdate;
    entry_sync_prose_cursor_update: SocketEventDataEntrySyncProseCursorUpdate;
    entry_sync_y_sync_req: SocketEventDataEntrySyncYSyncReq;
    entry_sync_y_sync_res: SocketEventDataEntrySyncYSyncRes;
    entry_sync_content_req: SocketEventDataEntrySyncDefaults;
    entry_sync_content_res: SocketEventDataEntrySyncContentResponse;
    entry_sync_string_update: SocketEventDataEntrySyncStringUpdate;
    entry_sync_number_update: SocketEventDataEntrySyncNumberUpdate;
    entry_sync_bool_update: SocketEventDataEntrySyncBooleanUpdate;
    entry_sync_date_update: SocketEventDataEntrySyncDateUpdate;
    entry_sync_enum_update: SocketEventDataEntrySyncEnumUpdate;
    entry_sync_media_update: SocketEventDataEntrySyncMediaUpdate;
    entry_sync_group_pointer_update: SocketEventDataEntrySyncGroupPointerUpdate;
    entry_sync_entry_pointer_update: SocketEventDataEntrySyncEntryPointerUpdate;
    entry_sync_rich_text_update: SocketEventDataEntrySyncRichTextUpdate;
    entry_sync_user_select_range: SocketEventDataEntrySyncUserSelectRange;
};
