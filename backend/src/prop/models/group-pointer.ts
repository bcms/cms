import type { ObjectSchema } from '@bcms/selfhosted-backend/_utils/object-utility';
import type {
    PropDataParsed,
    PropValue,
} from '@bcms/selfhosted-backend/prop/models/main';

export interface PropGroupPointerData {
    _id: string;
}

export interface PropGroupPointerDataParsed {
    [key: string]: PropDataParsed | PropDataParsed[];
}

export const PropGroupPointerDataSchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
};

export interface PropValueGroupPointerData {
    _id: string;
    items: Array<{
        props: PropValue[];
    }>;
}
