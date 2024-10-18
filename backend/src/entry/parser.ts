import type {
    Entry,
    EntryParsed,
} from '@bcms/selfhosted-backend/entry/models/main';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import type { Language } from '@bcms/selfhosted-backend/language/models/main';
import {
    PropType,
    type Prop,
    type PropDataParsed,
    type PropParsed,
    type PropValue,
} from '@bcms/selfhosted-backend/prop/models/main';
import type {
    PropMediaDataParsed,
    PropValueMediaData,
} from '@bcms/selfhosted-backend/prop/models/media';
import { MediaStorage } from '@bcms/selfhosted-backend/media/storage';
import type {
    PropGroupPointerData,
    PropGroupPointerDataParsed,
    PropValueGroupPointerData,
} from '@bcms/selfhosted-backend/prop/models/group-pointer';
import type { PropValueDateData } from '@bcms/selfhosted-backend/prop/models/date';
import type { PropValueRichTextData } from '@bcms/selfhosted-backend/prop/models/rich-text';
import type {
    PropEntryPointerData,
    PropValueEntryPointer,
} from '@bcms/selfhosted-backend/prop/models/entry-pointer';
import type { PropEnumData } from '@bcms/selfhosted-backend/prop/models/enum';
import {
    EntryContentNodeType,
    type EntryContentNode,
    type EntryContentNodeWidgetAttr,
    type EntryContentParsedItem,
} from '@bcms/selfhosted-backend/entry/models/content';
import { entryContentNodeToHtml } from '@bcms/selfhosted-backend/entry/content';

export function parseEntry(
    entry: Entry,
    templates: Template[],
    groups: Group[],
    widgets: Widget[],
    medias: Media[],
    entries: Entry[],
    languages: Language[],
    maxDepth: number,
    depth: number,
): EntryParsed {
    const entryParsed: EntryParsed = {
        _id: entry._id,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
        templateId: entry.templateId,
        templateName: '',
        userId: entry.userId,
        statuses: {},
        meta: {},
        content: {},
    };
    for (let i = 0; i < entry.statuses.length; i++) {
        const status = entry.statuses[i];
        entryParsed.statuses[status.lng] = status.id;
    }
    const template = templates.find((e) => e._id === entry.templateId);
    if (!template) {
        throw Error(`Template with ID "${entry.templateId}" does not exist`);
    }
    entryParsed.templateName = template.name;
    for (let i = 0; i < languages.length; i++) {
        const lng = languages[i];
        const meta = entry.meta.find((e) => e.lng === lng.code);
        entryParsed.meta[lng.code] = parsePropValues(
            templates,
            groups,
            widgets,
            medias,
            entries,
            languages,
            maxDepth,
            0,
            template.props,
            meta ? meta.props : undefined,
        );
        const content = entry.content.find((e) => e.lng === lng.code);
        entryParsed.content[lng.code] = content
            ? parseContentNodes(
                  templates,
                  groups,
                  widgets,
                  medias,
                  entries,
                  languages,
                  maxDepth,
                  depth,
                  content.nodes,
              )
            : [];
    }
    return entryParsed;
}

function parsePropValues(
    templates: Template[],
    groups: Group[],
    widgets: Widget[],
    medias: Media[],
    entries: Entry[],
    languages: Language[],
    maxDepth: number,
    depth: number,
    props: Prop[],
    values?: PropValue[],
): PropParsed {
    const output: PropParsed = {};
    if (values) {
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const value = values.find((e) => e.id === prop.id);
            output[prop.name] = parsePropValue(
                templates,
                groups,
                widgets,
                medias,
                entries,
                languages,
                maxDepth,
                depth,
                prop,
                value,
            );
        }
    } else {
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            output[prop.name] = parsePropValue(
                templates,
                groups,
                widgets,
                medias,
                entries,
                languages,
                maxDepth,
                depth,
                prop,
            );
        }
    }
    return output;
}

function parsePropValue(
    templates: Template[],
    groups: Group[],
    widgets: Widget[],
    medias: Media[],
    entries: Entry[],
    languages: Language[],
    maxDepth: number,
    depth: number,
    prop: Prop,
    value?: PropValue,
): PropDataParsed {
    if (value) {
        switch (prop.type) {
            case PropType.STRING: {
                const data = value.data as string[];
                if (prop.required) {
                    if (prop.array) {
                        return data || [];
                    } else {
                        return data[0] || '';
                    }
                } else {
                    if (prop.array) {
                        return data || null;
                    } else {
                        return data[0] || null;
                    }
                }
            }
            case PropType.NUMBER: {
                const data = value.data as number[];
                if (prop.required) {
                    if (prop.array) {
                        return data || [];
                    } else {
                        return data[0] || 0;
                    }
                } else {
                    if (prop.array) {
                        return data || null;
                    } else {
                        return data[0] || null;
                    }
                }
            }
            case PropType.BOOLEAN: {
                const data = value.data as boolean[];
                if (prop.required) {
                    if (prop.array) {
                        return data || [];
                    } else {
                        return data[0] || false;
                    }
                } else {
                    if (prop.array) {
                        return data || null;
                    } else {
                        return data[0] || null;
                    }
                }
            }
            case PropType.MEDIA: {
                /**
                 * We do not need to check required in this case
                 * because if prop is required and media is not set
                 * there is no valid fallback that we can do. Therefore,
                 * if media is not selected or not available, we will return
                 * undefined.
                 */
                const data = value.data as PropValueMediaData[];
                if (prop.array) {
                    const output: PropMediaDataParsed[] = [];
                    for (let i = 0; i < data.length; i++) {
                        const dataItem = data[i];
                        const media = medias.find(
                            (e) => e._id === dataItem._id,
                        );
                        if (!media) {
                            continue;
                        }
                        output.push({
                            _id: media._id,
                            type: media.type,
                            mimetype: media.mimetype,
                            alt_text: dataItem.alt_text || media.altText,
                            caption: dataItem.caption || media.caption,
                            name: media.name,
                            width: media.width,
                            height: media.height,
                            size: media.size,
                            src: MediaStorage.resolveFilePath(media, medias),
                        });
                    }
                    return output;
                } else {
                    const dataItem = data[0];
                    if (!data[0]) {
                        return undefined;
                    }
                    const media = medias.find((e) => e._id === dataItem._id);
                    if (!media) {
                        return undefined;
                    }
                    const output: PropMediaDataParsed = {
                        _id: media._id,
                        type: media.type,
                        mimetype: media.mimetype,
                        alt_text: dataItem.alt_text || media.altText,
                        caption: dataItem.caption || media.caption,
                        name: media.name,
                        width: media.width,
                        height: media.height,
                        size: media.size,
                        src: MediaStorage.resolveFilePath(media, medias),
                    };
                    return output;
                }
            }
            case PropType.GROUP_POINTER: {
                /**
                 * Same as for media, there is no fallback for this prop type
                 */
                const data = value.data as PropValueGroupPointerData;
                if (depth >= maxDepth) {
                    return data;
                }
                const group = groups.find((e) => e._id === data._id);
                if (!group) {
                    return undefined;
                }
                if (prop.array) {
                    const output: PropGroupPointerDataParsed[] = [];
                    for (let i = 0; i < data.items.length; i++) {
                        const item = data.items[i];
                        output.push(
                            parsePropValues(
                                templates,
                                groups,
                                widgets,
                                medias,
                                entries,
                                languages,
                                maxDepth,
                                depth + 1,
                                group.props,
                                item.props,
                            ),
                        );
                    }
                    return output;
                } else {
                    const item = data.items[0];
                    if (!item) {
                        return undefined;
                    }
                    return parsePropValues(
                        templates,
                        groups,
                        widgets,
                        medias,
                        entries,
                        languages,
                        maxDepth,
                        depth + 1,
                        group.props,
                        item && item.props ? item.props : undefined,
                    );
                }
            }
            case PropType.ENUMERATION: {
                const data = value.data as string[];
                if (prop.required) {
                    if (prop.array) {
                        return data || [];
                    } else {
                        return data[0] || '';
                    }
                } else {
                    if (prop.array) {
                        return data || null;
                    } else {
                        return data[0] || null;
                    }
                }
            }
            case PropType.DATE: {
                const data = value.data as PropValueDateData[];
                if (prop.required) {
                    if (prop.array) {
                        return data || [];
                    } else {
                        return data[0] || '';
                    }
                } else {
                    if (prop.array) {
                        return data || null;
                    } else {
                        return data[0] || null;
                    }
                }
            }
            case PropType.RICH_TEXT: {
                const data = value.data as PropValueRichTextData[];
                if (prop.array) {
                    return data.map((dataItem) => {
                        return {
                            nodes: parseContentNodes(
                                templates,
                                groups,
                                widgets,
                                medias,
                                entries,
                                languages,
                                maxDepth,
                                depth,
                                dataItem.nodes,
                            ),
                        };
                    });
                } else {
                    return {
                        nodes: data[0]
                            ? parseContentNodes(
                                  templates,
                                  groups,
                                  widgets,
                                  medias,
                                  entries,
                                  languages,
                                  maxDepth,
                                  depth,
                                  data[0].nodes,
                              )
                            : [],
                    };
                }
            }
            case PropType.ENTRY_POINTER: {
                const data = value.data as PropValueEntryPointer[];
                if (depth >= maxDepth) {
                    return data;
                }
                if (prop.array) {
                    const output: EntryParsed[] = [];
                    for (let i = 0; i < data.length; i++) {
                        const dataItem = data[i];
                        const entry = entries.find(
                            (e) => e._id === dataItem.eid,
                        );
                        if (!entry) {
                            continue;
                        }
                        output.push(
                            parseEntry(
                                entry,
                                templates,
                                groups,
                                widgets,
                                medias,
                                entries,
                                languages,
                                maxDepth,
                                depth + 1,
                            ),
                        );
                    }
                    return output;
                } else {
                    if (!data[0]) {
                        return undefined;
                    }
                    const entry = entries.find((e) => e._id === data[0].eid);
                    if (!entry) {
                        return undefined;
                    }
                    return parseEntry(
                        entry,
                        templates,
                        groups,
                        widgets,
                        medias,
                        entries,
                        languages,
                        maxDepth,
                        depth + 1,
                    );
                }
            }
            default: {
                throw Error(
                    `Prop type "${
                        prop.type
                    }" is not handled -> ${JSON.stringify(prop, null, '  ')}`,
                );
            }
        }
    } else {
        if (prop.required) {
            if (prop.array) {
                return [];
            } else {
                switch (prop.type) {
                    case PropType.BOOLEAN: {
                        return false;
                    }
                    case PropType.ENTRY_POINTER: {
                        return prop.data
                            .propEntryPointer as PropEntryPointerData[];
                    }
                    case PropType.ENUMERATION: {
                        return prop.data.propEnum as PropEnumData;
                    }
                    case PropType.GROUP_POINTER: {
                        const data = prop.data
                            .propGroupPointer as PropGroupPointerData;
                        if (depth >= maxDepth) {
                            return null;
                        }
                        const group = groups.find((e) => e._id === data._id);
                        if (!group) {
                            /**
                             * In this case there is no fallback that we can do
                             * and we return undefined even though that
                             * property is required.
                             */
                            return undefined;
                        }
                        return parsePropValues(
                            templates,
                            groups,
                            widgets,
                            medias,
                            entries,
                            languages,
                            maxDepth,
                            depth + 1,
                            group.props,
                        );
                    }
                    case PropType.MEDIA: {
                        return null;
                    }
                    case PropType.NUMBER: {
                        return 0;
                    }
                    case PropType.DATE: {
                        return {
                            timestamp: -1,
                            timezoneOffset: 0,
                        };
                    }
                    case PropType.STRING: {
                        return '';
                    }
                    case PropType.RICH_TEXT: {
                        return [];
                    }
                }
            }
        } else {
            if (prop.array) {
                return null;
            } else {
                return null;
            }
        }
    }
}

function parseContentNodes(
    templates: Template[],
    groups: Group[],
    widgets: Widget[],
    medias: Media[],
    entries: Entry[],
    languages: Language[],
    maxDepth: number,
    depth: number,
    nodes: EntryContentNode[],
): EntryContentParsedItem[] {
    const output: EntryContentParsedItem[] = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        output.push(
            parseContentNode(
                templates,
                groups,
                widgets,
                medias,
                entries,
                languages,
                maxDepth,
                depth,
                node,
            ),
        );
    }
    return output;
}

function parseContentNode(
    templates: Template[],
    groups: Group[],
    widgets: Widget[],
    medias: Media[],
    entries: Entry[],
    languages: Language[],
    maxDepth: number,
    depth: number,
    node: EntryContentNode,
): EntryContentParsedItem {
    const output: EntryContentParsedItem = {
        type: node.type,
        value: '',
    };
    if (node.type === EntryContentNodeType.widget) {
        const attrs = node.attrs as EntryContentNodeWidgetAttr;
        const widget = widgets.find((e) => e._id === attrs.data._id);
        if (widget) {
            output.widgetName = widget.name;
            output.value = parsePropValues(
                templates,
                groups,
                widgets,
                medias,
                entries,
                languages,
                maxDepth,
                depth + 1,
                widget.props,
                attrs.data.props,
            );
        } else {
            output.widgetName = attrs.data._id;
            output.value = `<div bcms-data-widget='${JSON.stringify(
                attrs,
            )}'></div>`;
        }
    } else {
        if (node.attrs) {
            output.attrs = node.attrs;
        }
        output.value = entryContentNodeToHtml(node);
    }
    return output;
}
