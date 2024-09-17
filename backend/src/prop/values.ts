import {
    type Prop,
    PropType,
    type PropValue,
} from '@bcms/selfhosted-backend/prop/models/main';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import {
    ObjectUtility,
    ObjectUtilityError,
} from '@bcms/selfhosted-backend/_utils/object-utility';
import {
    type PropValueDateData,
    PropValueDateDataSchema,
} from '@bcms/selfhosted-backend/prop/models/date';
import {
    type PropValueMediaData,
    PropValueMediaDataSchema,
} from '@bcms/selfhosted-backend/prop/models/media';
import type {
    PropValueWidgetData,
    PropWidgetData,
} from '@bcms/selfhosted-backend/prop/models/widget';
import type {
    PropGroupPointerData,
    PropValueGroupPointerData,
} from '@bcms/selfhosted-backend/prop/models/group-pointer';
import {
    type PropEntryPointerData,
    type PropValueEntryPointer,
    PropValueEntryPointerSchema,
} from '@bcms/selfhosted-backend/prop/models/entry-pointer';

export function propsValueCheck(
    props: Prop[],
    values: PropValue[],
    level: string,
    widgets: Widget[],
    groups: Group[],
    templates: Template[],
    medias: Media[],
): Error | void {
    if (props.length !== values.length) {
        return Error(`[${level}] -> props and values are not the same length.`);
    }
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const value = values.find((e) => e.id === prop.id);
        if (!value) {
            return Error(`[${level}.${prop.name}] -> No value found.`);
        }
        switch (prop.type) {
            case PropType.STRING:
                {
                    const valueData = value.data as string[];
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: valueData,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'string',
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                        for (let j = 0; j < valueData.length; j++) {
                            if (valueData[i] === '') {
                                return Error(
                                    `[${level}.${prop.name}.data.${j}] -> Property is required and must contain a value`,
                                );
                            }
                        }
                    }
                }
                break;

            case PropType.NUMBER:
                {
                    const valueData = value.data as number[];
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: value.data,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'number',
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                    }
                }
                break;

            case PropType.BOOLEAN:
                {
                    const valueData = value.data as boolean[];
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: valueData,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'boolean',
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                    }
                }
                break;

            case PropType.DATE:
                {
                    const valueData = value.data as PropValueDateData[];
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: valueData,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'object',
                                    __content: PropValueDateDataSchema,
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                    }
                }
                break;

            case PropType.ENUMERATION:
                {
                    const valueData = value.data as string[];
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: valueData,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'string',
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                        for (let j = 0; j < valueData.length; j++) {
                            if (
                                !prop.data.propEnum?.items.includes(
                                    valueData[j],
                                )
                            ) {
                                return Error(
                                    `[${level}.${prop.name}.data.${j}] -> Enumeration value is required. ` +
                                        `Value of "${
                                            valueData[j]
                                        }" is not allowed in list: ${prop.data.propEnum?.items.join(
                                            ', ',
                                        )}`,
                                );
                            }
                        }
                    }
                }
                break;

            case PropType.MEDIA:
                {
                    const valueData = value.data as PropValueMediaData[];
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: value.data,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'object',
                                    __content: PropValueMediaDataSchema,
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                        for (let j = 0; j < valueData.length; j++) {
                            if (!valueData[j]) {
                                return Error(
                                    `[${level}.${prop.name}.data.${j}] -> Media is required.`,
                                );
                            }
                            const media = medias.find(
                                (e) => e._id === valueData[j]._id,
                            );
                            if (!media) {
                                return Error(
                                    `[${level}.${prop.name}.data.${j}] -> Media with ID "${valueData[j]._id}" does not exist`,
                                );
                            }
                        }
                    }
                }
                break;

            case PropType.WIDGET:
                {
                    const propData = prop.data.propWidget as PropWidgetData;
                    const valueData = value.data as PropValueWidgetData;
                    if (propData._id !== valueData._id) {
                        return Error(
                            `[${level}.${prop.name}._id] -> ` +
                                'Prop and value widget IDs do not match.',
                        );
                    }
                    const widget = widgets.find((e) => e._id === propData._id);
                    if (!widget) {
                        return Error(
                            `[${level}.${prop.name}._id] -> ` +
                                `Widget with ID ${propData._id} does not exist.`,
                        );
                    }
                    const widgetCheckResult = propsValueCheck(
                        widget.props,
                        valueData.props,
                        `${level}.${prop.name}.props`,
                        widgets,
                        groups,
                        templates,
                        medias,
                    );
                    if (widgetCheckResult instanceof Error) {
                        return widgetCheckResult;
                    }
                }
                break;

            case PropType.GROUP_POINTER:
                {
                    const propData = prop.data
                        .propGroupPointer as PropGroupPointerData;
                    const valueData = value.data as PropValueGroupPointerData;
                    if (propData._id !== valueData._id) {
                        return Error(
                            `[${level}.${prop.name}._id] -> ` +
                                'Prop and value group pointer IDs do not match.',
                        );
                    }
                    const group = groups.find((e) => e._id === propData._id);
                    if (!group) {
                        return Error(
                            `[${level}.${prop.name}._id] -> ` +
                                `Group with ID ${propData._id} does not exist.`,
                        );
                    }
                    if (prop.required) {
                        if (valueData.items.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                    }
                    for (let j = 0; j < valueData.items.length; j++) {
                        const item = valueData.items[j];
                        const groupCheckPropValuesResult = propsValueCheck(
                            group.props,
                            item.props,
                            `${level}.${prop.name}.items.${j}.props`,
                            widgets,
                            groups,
                            templates,
                            medias,
                        );
                        if (groupCheckPropValuesResult instanceof Error) {
                            return groupCheckPropValuesResult;
                        }
                    }
                }
                break;

            case PropType.ENTRY_POINTER:
                {
                    const checkData = ObjectUtility.compareWithSchema(
                        {
                            data: value.data,
                        },
                        {
                            data: {
                                __type: 'array',
                                __required: true,
                                __child: {
                                    __type: 'object',
                                    __content: PropValueEntryPointerSchema,
                                },
                            },
                        },
                        `${level}.${prop.name}`,
                    );
                    if (checkData instanceof ObjectUtilityError) {
                        return Error(
                            `[${level}.${prop.name}] -> ` + checkData.message,
                        );
                    }
                    const propData = prop.data
                        .propEntryPointer as PropEntryPointerData[];
                    const valueData = value.data as PropValueEntryPointer[];
                    if (prop.required) {
                        if (valueData.length === 0) {
                            return Error(
                                `[${level}.${prop.name}.data] -> Property is required and must contain a value`,
                            );
                        }
                    }
                    for (let j = 0; j < valueData.length; j++) {
                        const valueInfo = valueData[j];
                        const propInfo = propData.find(
                            (e) => e.templateId === valueInfo.tid,
                        );
                        if (!propInfo) {
                            return Error(
                                `[${level}.${prop.name}.${j}.templateId] -> ` +
                                    `Template ID "${valueInfo.tid}" is not allowed for this property.`,
                            );
                        }
                        if (prop.required && !valueInfo.eid) {
                            return Error(
                                `[${level}.${prop.name}.data.${j}.eid] -> Property is required and must contain a value`,
                            );
                        }
                    }
                }
                break;

            case PropType.RICH_TEXT:
                {
                    // const checkData = ObjectUtility.compareWithSchema(
                    //   {
                    //     data: value.data,
                    //   },
                    //   {
                    //     data: {
                    //       __type: 'array',
                    //       __required: true,
                    //       __child: {
                    //         __type: 'object',
                    //         __content: {
                    //           nodes: {
                    //             __type: 'array',
                    //             __required: true,
                    //             __child: {},
                    //           },
                    //         },
                    //       },
                    //     },
                    //   },
                    //   `${level}.${prop.name}`,
                    // );
                    // if (checkData instanceof ObjectUtilityError) {
                    //   console.log(EntryContentNodePartialSchema, value.data)
                    //   return Error(`[${level}.${prop.name}] -> ` + checkData.message);
                    // }
                }
                break;
        }
    }
}
