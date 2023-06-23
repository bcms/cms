export interface BCMSTooltipService {
  show(target: HTMLElement, message: string, type: 'default' | 'info'): void;
  hide(): void;
}
