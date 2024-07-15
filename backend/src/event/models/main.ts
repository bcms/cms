export type BCMSEventScope = 'all' | 'user';

export type BCMSEventType = 'all' | 'update' | 'add' | 'delete';

export interface BCMSEventConfig {
    scopes: BCMSEventScope;
    type: BCMSEventType;
}

export interface BCMSEvent {
    config: BCMSEventConfig;
}
