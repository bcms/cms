import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import {
    type SocketEventDataDefault,
    SocketEventDataDefaultSchema,
} from './main';

export interface SocketEventDataWidget extends SocketEventDataDefault {
    widgetId: string;
}

export const SocketEventDataWidgetSchema: ObjectSchema = {
    ...SocketEventDataDefaultSchema,
    widgetId: {
        __type: 'string',
        __required: true,
    },
};

export type SocketEventNamesWidget = {
    widget: SocketEventDataWidget;
};
