import {
    type Prop,
    PropType,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { PropChange } from '@thebcms/selfhosted-backend/prop/models/change';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import { PropFactory } from '@thebcms/selfhosted-backend/prop/factory';
import { StringUtility } from '@thebcms/selfhosted-backend/_utils/string-utility';
import type { PropDateData } from '@thebcms/selfhosted-backend/prop/models/date';
import type { PropEnumData } from '@thebcms/selfhosted-backend/prop/models/enum';
import type { PropMediaData } from '@thebcms/selfhosted-backend/prop/models/media';
import type { PropGroupPointerData } from '@thebcms/selfhosted-backend/prop/models/group-pointer';
import type { PropWidgetData } from '@thebcms/selfhosted-backend/prop/models/widget';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@thebcms/selfhosted-backend/_utils/object-utility';
import { PropEntryPointerDataSchema } from '@thebcms/selfhosted-backend/prop/models/entry-pointer';

export function propsApplyChanges(
    propsToChange: Prop[],
    changes: PropChange[],
    level: string,
    inTemplate: boolean,
    allMedia: Media[],
    groups: Group[],
    widgets: Widget[],
    templates: Template[],
): Prop[] | Error {
    const props: Prop[] = JSON.parse(JSON.stringify(propsToChange));
    for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        if (typeof change.remove === 'string') {
            const propToRemoveIndex = props.findIndex(
                (e) => e.id === change.remove,
            );
            if (inTemplate && props[0].name === 'title') {
                if (propToRemoveIndex > 1) {
                    props.splice(propToRemoveIndex, 1);
                }
            } else {
                props.splice(propToRemoveIndex, 1);
            }
        } else if (typeof change.add === 'object') {
            const prop = PropFactory.create(change.add.type, change.add.array);
            if (!prop) {
                return Error(
                    `Invalid property type "${change.add.type}"` +
                        ` was provided as "changes[${i}].add.type".`,
                );
            }
            prop.label = change.add.label;
            prop.name = StringUtility.toSlugUnderscore(change.add.label);
            prop.required = change.add.required;
            prop.array = change.add.array;
            if (props.find((e) => e.name === prop.name)) {
                return Error(
                    `[${level}] -> Prop with name "${prop.name}" already exists.`,
                );
            }
            if (prop.type === PropType.STRING) {
                if (change.add.data.propString) {
                    prop.data.propString = change.add.data.propString;
                }
            } else if (prop.type === PropType.NUMBER) {
                if (change.add.data.propNumber) {
                    prop.data.propNumber = change.add.data.propNumber;
                }
            } else if (prop.type === PropType.BOOLEAN) {
                if (change.add.data.propBool) {
                    prop.data.propBool = change.add.data.propBool;
                }
            } else if (prop.type === PropType.DATE) {
                const changeData = change.add.data.propDate;
                if (!changeData) {
                    return Error(
                        `[${level}.change.${i}.add.defaultData] -> Missing prop.`,
                    );
                }
                for (let j = 0; j < changeData.length; j++) {
                    (prop.data.propDate as PropDateData[]).push(changeData[j]);
                }
            } else if (prop.type === PropType.ENUMERATION) {
                const changeData = change.add.data.propEnum;
                if (!changeData || !changeData.items[0]) {
                    return Error(
                        `[${level}.change.${i}.add.defaultData] -> Missing prop.`,
                    );
                }
                if (changeData.selected) {
                    if (!changeData.items.includes(changeData.selected)) {
                        return Error(
                            `[${level}.change.${i}.add.defaultData] -> Select enum do not exist in items.`,
                        );
                    }
                }
                (prop.data.propEnum as PropEnumData) = {
                    items: changeData.items,
                    selected: changeData.selected,
                };
            } else if (prop.type === PropType.MEDIA) {
                const defaultData = change.add.data.propMedia;
                if (defaultData && defaultData.length > 0) {
                    for (let j = 0; j < defaultData.length; j++) {
                        const data = defaultData[j];
                        if (data) {
                            const media = allMedia.find((e) => e._id === data);
                            if (!media) {
                                return Error(
                                    `[${level}.change.${i}.add.defaultData] ->` +
                                        ` Media with ID "${data}" does not exist.`,
                                );
                            }
                            (prop.data.propMedia as PropMediaData[]).push(
                                media._id,
                            );
                        }
                    }
                }
            } else if (prop.type === PropType.GROUP_POINTER) {
                const changeData = change.add.data.propGroupPointer;
                if (!changeData || !changeData._id) {
                    return Error(
                        `[${level}.change.${i}.add.defaultData] -> Missing prop "_id".`,
                    );
                }
                const group = groups.find((e) => e._id === changeData._id);
                if (!group) {
                    return Error(
                        `[${level}.change.${i}.add.defaultData._id] ->` +
                            ` Group with ID "${changeData._id}" does not exist.`,
                    );
                }
                (prop.data.propGroupPointer as PropGroupPointerData) = {
                    _id: changeData._id,
                };
            } else if (prop.type === PropType.WIDGET) {
                const changeData = change.add.data.propWidget;
                if (!changeData || !changeData._id) {
                    return Error(
                        `[${level}.change.${i}.add.defaultData] -> Missing prop "_id".`,
                    );
                }
                const widget = widgets.find((e) => e._id === changeData._id);
                if (!widget) {
                    return Error(
                        `[${level}.change.${i}.add.defaultData._id] ->` +
                            ` Widget with ID "${changeData._id}" does not exist.`,
                    );
                }
                (prop.data.propWidget as PropWidgetData) = {
                    _id: changeData._id,
                };
            } else if (prop.type === PropType.ENTRY_POINTER) {
                const changeData = change.add.data.propEntryPointer;
                if (!changeData) {
                    return Error(
                        `[${level}.change.${i}.add] ->` +
                            ` Missing prop "defaultData".`,
                    );
                }
                let data = prop.data.propEntryPointer;
                if (!data) {
                    prop.data.propEntryPointer = [];
                    data = prop.data.propEntryPointer;
                }
                for (let j = 0; j < changeData.length; j++) {
                    const changeInfo = changeData[j];
                    if (!changeInfo || !changeInfo.templateId) {
                        return Error(
                            `[${level}.change.${i}.add.defaultData.${j}] ->` +
                                ` Missing prop "templateId".`,
                        );
                    }
                    if (
                        data.find((e) => e.templateId === changeInfo.templateId)
                    ) {
                        return Error(
                            `[${level}.change.${i}.add.defaultData.${j}.templateId] ->` +
                                ` Template ID "${changeInfo.templateId}" is already added.`,
                        );
                    }
                    const template = templates.find(
                        (e) => e._id === changeInfo.templateId,
                    );
                    if (!template) {
                        return Error(
                            `[${level}.change.${i}.add.defaultData.${j}.templateId] ->` +
                                ` Template with ID "${changeInfo.templateId}" does not exist.`,
                        );
                    }
                    data.push({
                        displayProp: 'title',
                        templateId: template._id,
                        entryIds: changeInfo.entryIds || [],
                    });
                }
            } else if (prop.type === PropType.RICH_TEXT) {
                if (change.add.data.propRichText) {
                    prop.data.propRichText = [];
                    const defaultData = change.add.data.propRichText;
                    for (let j = 0; j < defaultData.length; j++) {
                        const data = defaultData[j];
                        if (data.nodes) {
                            prop.data.propRichText.push(data);
                        }
                    }
                }
            }
            props.push(prop);
        } else if (typeof change.update !== 'undefined') {
            const update = change.update;
            const propToUpdateIndex = props.findIndex(
                (e) => e.id === update.id,
            );
            if (
                (inTemplate && propToUpdateIndex > 1) ||
                (!inTemplate && propToUpdateIndex !== -1)
            ) {
                const propBuffer = props[propToUpdateIndex];
                if (propBuffer.label !== update.label) {
                    const newName = StringUtility.toSlugUnderscore(
                        update.label,
                    );
                    if (props.find((e) => e.name === newName)) {
                        return Error(
                            `[${level}] -> Prop with name "${newName}" already exists.`,
                        );
                    }
                    propBuffer.label = update.label;
                    propBuffer.name = newName;
                }
                propBuffer.required = update.required;
                if (update.enumItems && propBuffer.data.propEnum) {
                    propBuffer.data.propEnum.items = update.enumItems;
                }
                if (update.move) {
                    if (inTemplate) {
                        update.move += 2;
                    }
                    const targetPropIndex = propToUpdateIndex + update.move;
                    if (
                        targetPropIndex > -1 &&
                        targetPropIndex < props.length
                    ) {
                        const temp = JSON.parse(
                            JSON.stringify(
                                props[propToUpdateIndex + update.move],
                            ),
                        );
                        props[targetPropIndex] = propBuffer;
                        props[propToUpdateIndex] = temp;
                    }
                } else {
                    props[propToUpdateIndex] = propBuffer;
                }
                if (update.entryPointer) {
                    const check = ObjectUtility.compareWithSchema(
                        {
                            entryPointer: update.entryPointer,
                        },
                        {
                            entryPointer: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'object',
                                    __content: PropEntryPointerDataSchema,
                                },
                            },
                        },
                    );
                    if (check instanceof ObjectUtilityError) {
                        return Error(`[${level}] -> ${check.message}`);
                    }
                    propBuffer.data.propEntryPointer = update.entryPointer;
                }
                if (typeof update.array === 'boolean') {
                    if (propBuffer.type !== PropType.ENUMERATION) {
                        propBuffer.array = update.array;
                    }
                }
            }
        }
    }
    return props;
}
