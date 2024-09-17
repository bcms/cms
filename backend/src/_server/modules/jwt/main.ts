import type { Module } from '@bcms/selfhosted-backend/_server/module';
import { JWTManager } from '@bcms/selfhosted-backend/_server/modules/jwt/manager';
import type { JWTScope } from '@bcms/selfhosted-backend/_server/modules/jwt/models';

export interface JWTConfig {
    scopes: JWTScope[];
}

export function createJwt(config: JWTConfig): Module {
    return {
        name: 'JWT',
        initialize({ next }) {
            JWTManager.setScopes(config.scopes);
            next();
        },
    };
}
