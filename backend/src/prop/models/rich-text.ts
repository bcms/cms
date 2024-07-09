import type {
    EntryContentNode,
    EntryContentParsedItem,
} from '@thebcms/selfhosted-backend/entry/models/content';

export interface PropRichTextData {
    nodes: EntryContentNode[];
}

export interface PropValueRichTextData {
    nodes: EntryContentNode[];
}

export type PropRichTextDataParsed = {
    nodes: EntryContentParsedItem[];
};
