import type { ObjectSchema } from '@thebcms/selfhosted-backend/_utils/object-utility';

export interface MediaGetBinBodyImage {
    width?: number;
    height?: number;
    quality?: number;
    webp?: boolean;
}

export const MediaGetBinBodyImageSchema: ObjectSchema = {
    width: {
        __type: 'number',
        __required: false,
    },
    height: {
        __type: 'number',
        __required: false,
    },
    quality: {
        __type: 'number',
        __required: false,
    },
    webp: {
        __type: 'boolean',
        __required: false,
    },
};

export interface MediaGetBinBody {
    thumbnail?: boolean;
    view?: boolean;
    image?: MediaGetBinBodyImage;
}

export const MediaGetBinBodySchema: ObjectSchema = {
    thumbnail: {
        __type: 'boolean',
        __required: false,
    },
    view: {
        __type: 'boolean',
        __required: false,
    },
    image: {
        __type: 'object',
        __required: false,
        __child: MediaGetBinBodyImageSchema,
    },
};

export interface MediaRequestUploadTokenResult {
    token: string;
}

export const MediaRequestUploadTokenResultSchema: ObjectSchema = {
    token: {
        __type: 'string',
        __required: true,
    },
};

export interface MediaCreateDirBody {
    name: string;
    parentId?: string;
}

export const MediaCreateDirBodySchema: ObjectSchema = {
    name: {
        __type: 'string',
        __required: true,
    },
    parentId: {
        __type: 'string',
        __required: false,
    },
};

export interface MediaUpdateBody {
    _id: string;
    parentId?: string;
    altText?: string;
    caption?: string;
    name?: string;
}

export const MediaUpdateBodySchema: ObjectSchema = {
    _id: {
        __type: 'string',
        __required: true,
    },
    parentId: {
        __type: 'string',
        __required: false,
    },
    altText: {
        __type: 'string',
        __required: false,
    },
    caption: {
        __type: 'string',
        __required: false,
    },
    name: {
        __type: 'string',
        __required: false,
    },
};

export interface MediaDeleteBody {
    mediaIds: string[];
}

export const MediaDeleteBodySchema: ObjectSchema = {
    mediaIds: {
        __type: 'array',
        __required: true,
        __child: {
            __type: 'string',
        },
    },
};
