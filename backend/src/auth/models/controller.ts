import type { ObjectSchema } from '@bcms/selfhosted-utils/object-utility';

export interface AuthLoginResponse {
    accessToken: string;
    refreshToken: string;
}

export const AuthLoginResponseSchema: ObjectSchema = {
    accessToken: {
        __type: 'string',
        __required: true,
    },
    refreshToken: {
        __type: 'string',
        __required: true,
    },
};

export interface AuthLoginBody {
    email: string;
    password: string;
}

export const AuthLoginBodySchema: ObjectSchema = {
    email: {
        __type: 'string',
        __required: true,
    },
    password: {
        __type: 'string',
        __required: true,
    },
};

export interface AuthSignUpAdminBody {
    serverToken: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export const AuthSignUpAdminBodySchema: ObjectSchema = {
    serverToken: {
        __type: 'string',
        __required: true,
    },
    email: {
        __type: 'string',
        __required: true,
    },
    password: {
        __type: 'string',
        __required: true,
    },
    firstName: {
        __type: 'string',
        __required: true,
    },
    lastName: {
        __type: 'string',
        __required: true,
    },
};
