export interface TooltipService {
    show(target: HTMLElement, message: string, type: 'default' | 'info'): void;
    hide(): void;
}

let service: TooltipService;

export function createTooltipService() {
    service = {
        show() {
            throw new Error('Assertion error');
        },
        hide() {
            throw new Error('Assertion error');
        },
    };
    return service;
}

export function useTooltipService(): TooltipService {
    return service;
}
