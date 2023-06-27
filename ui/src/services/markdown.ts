import MarkdownIt from 'markdown-it';
import type { BCMSMarkdownService } from '../types';

let service: BCMSMarkdownService;

export function createBcmsMarkdownService(): void {
  const markdownIt = MarkdownIt({
    html: true,
  });
  service = {
    toHtml(markdown) {
      return markdownIt.render(markdown).replace(/src=/g, 'src-disabled=');
    },
  };
}

export function useBcmsMarkdownService(): BCMSMarkdownService {
  return service;
}
