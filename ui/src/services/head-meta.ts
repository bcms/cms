export interface HeadMetaService {
    set(options: { title?: string }): void;
}

let service: HeadMetaService;

export function createHeadMetaService() {
    service = {
        set(options) {
            if (options.title) {
                document.title = `${options.title} | BCMS`;
            }
        },
    };
    return service;
}

export function useHeadMetaService(): HeadMetaService {
    return service;
}
