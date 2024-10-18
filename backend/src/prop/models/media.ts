import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';
import type { MediaType } from '@bcms/selfhosted-backend/media/models/main';

export type PropMediaData = string;

export interface PropMediaDataParsed {
    _id: string;
    src: string;
    name: string;
    width: number;
    height: number;
    caption: string;
    alt_text: string;
    type: MediaType;
    mimetype: string;
    size: number;
}

export interface PropValueMediaData {
    _id: string;
    alt_text?: string;
    caption?: string;
}

export const PropValueMediaDataSchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    alt_text: {
        __type: 'string',
        __required: false,
    },
    caption: {
        __type: 'string',
        __required: false,
    },
};
