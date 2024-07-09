import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';
import type {
    PropDataParsed,
    PropValue,
} from '@thebcms/selfhosted-backend/prop/models/main';

export interface PropWidgetData {
    _id: string;
}

export const PropWidgetDataSchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
};

export interface PropWidgetDataParsed {
    [key: string]: PropDataParsed;
}

export interface PropValueWidgetData {
    _id: string;
    props: PropValue[];
}
