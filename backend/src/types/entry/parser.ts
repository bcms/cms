import type {
  BCMSEntry,
  BCMSEntryParsed,
  BCMSEntryContentParsedItem,
  BCMSEntryContentNode,
  BCMSEntryContent,
} from './models';

export interface BCMSEntryParser {
  parse(data: {
    programLng: 'rust' | 'js';
    entry: BCMSEntry;
    justLng?: string;
    level?: string;
    depth?: number;
    maxDepth: number;
  }): Promise<BCMSEntryParsed | null>;
  parseContent(data: {
    programLng: 'rust' | 'js';
    nodes: BCMSEntryContentNode[];
    level?: string;
    justLng?: string;
    depth?: number;
    maxDepth: number;
  }): Promise<BCMSEntryContentParsedItem[]>;
  injectPlaneText(data: {
    content: BCMSEntryContent[];
  }): Promise<BCMSEntryContent[]>;
}
