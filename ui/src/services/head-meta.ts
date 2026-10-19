import { t } from '@bcms/selfhosted-ui/i18n';

export interface HeadMetaOptions {
    title?: string;
    titleKey?: string;
    titleParams?: Record<string, unknown>;
}

export interface HeadMetaService {
    set(options: HeadMetaOptions): void;
    refresh(): void;
}

let service: HeadMetaService;

let current: HeadMetaOptions = {};

function applyTitle() {
    const title = current.titleKey
        ? t(current.titleKey, current.titleParams)
        : current.title;
    if (title) {
        document.title = `${title} | BCMS`;
    }
}

export function createHeadMetaService() {
    service = {
        set(options) {
            current = { ...options };
            applyTitle();
        },
        refresh() {
            applyTitle();
        },
    };
    return service;
}

export function useHeadMetaService(): HeadMetaService {
    return service;
}
