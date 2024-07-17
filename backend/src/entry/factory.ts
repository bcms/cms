import { ObjectId } from 'mongodb';
import type {
    Entry,
    EntryLite,
    EntryLiteInfo,
} from '@thebcms/selfhosted-backend/entry/models/main';
import {
    PropType,
    type Prop,
    type PropValue,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type {
    PropGroupPointerData,
    PropValueGroupPointerData,
} from '@thebcms/selfhosted-backend/prop/models/group-pointer';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import type { PropValueMediaData } from '@thebcms/selfhosted-backend/prop/models/media';

export class EntryFactory {
    static create(data: Omit<Entry, '_id' | 'createdAt' | 'updatedAt'>): Entry {
        return {
            _id: `${new ObjectId()}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ...data,
        };
    }

    private static findFirstMediaProp(
        props: Prop[],
        values: PropValue[],
        groups: Group[],
        valuePath: (string | number)[],
    ): { prop: Prop; value: PropValue; valuePath: (string | number)[] } | null {
        // if (props.length !== values.length) {
        //     console.log({props, values})
        //     throw Error(
        //         `[${valuePath.join(
        //             '.',
        //         )}] -> props and values are not the same length.`,
        //     );
        // }
        for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const valueIdx = values.findIndex((e) => e.id === prop.id);
            if (valueIdx === -1) {
                continue;
            }
            if (prop.type === PropType.MEDIA) {
                return {
                    prop,
                    value: values[valueIdx],
                    valuePath: [...valuePath, valueIdx],
                };
            } else if (prop.type === PropType.GROUP_POINTER) {
                const propData = prop.data
                    .propGroupPointer as PropGroupPointerData;
                const valueData = values[valueIdx]
                    .data as PropValueGroupPointerData;
                if (propData._id !== valueData._id) {
                    continue;
                }
                const group = groups.find((e) => e._id === propData._id);
                if (!group) {
                    continue;
                }
                for (let j = 0; j < valueData.items.length; j++) {
                    const item = valueData.items[j];
                    const checkResult = EntryFactory.findFirstMediaProp(
                        group.props,
                        item.props,
                        groups,
                        [...valuePath, valueIdx, 'data', 'items', j],
                    );
                    if (checkResult) {
                        return checkResult;
                    }
                }
            }
        }
        return null;
    }

    static toLite(
        entry: Entry,
        template: Template,
        groups: Group[],
    ): EntryLite {
        const entryLite: EntryLite = {
            _id: entry._id,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            templateId: entry.templateId,
            userId: entry.userId,
            info: [],
        };
        for (let i = 0; i < entry.meta.length; i++) {
            const entryMeta = entry.meta[i];
            const status = entry.statuses.find((e) => e.lng === entryMeta.lng);
            const info: EntryLiteInfo = {
                lng: entryMeta.lng,
                title: (entryMeta.props[0].data as string[])[0],
                slug: (entryMeta.props[1].data as string[])[0],
                status: status?.id,
            };
            const mediaCheck = EntryFactory.findFirstMediaProp(
                template.props,
                entryMeta.props,
                groups,
                [],
            );
            if (
                mediaCheck &&
                (mediaCheck.value.data as PropValueMediaData[])[0]
            ) {
                info.media = (
                    mediaCheck.value.data as PropValueMediaData[]
                )[0]._id;
            }
            for (let j = 2; j < template.props.length; j++) {
                const propSchema = template.props[j];
                const propValue = entryMeta.props.find(
                    (e) => e.id === propSchema.id,
                );
                if (propValue) {
                    if (
                        !info.description &&
                        propSchema.type === PropType.STRING
                    ) {
                        info.description = (propValue.data as string[])[0];
                        break;
                    }
                }
            }
            entryLite.info.push(info);
        }
        return entryLite;
    }
}
