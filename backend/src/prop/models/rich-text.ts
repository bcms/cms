import type {
    EntryContentNode,
    EntryContentParsedItem,
} from '@bcms/selfhosted-backend/entry/models/content';

export interface PropRichTextData {
    nodes: EntryContentNode[];
}

export interface PropValueRichTextData {
    nodes: EntryContentNode[];
}

export type PropRichTextDataParsed = {
    nodes: EntryContentParsedItem[];
};
