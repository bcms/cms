import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
} from 'vue';
import type {
    Prop,
    PropValue,
} from '@bcms/selfhosted-backend/prop/models/main';
import {
    propApplyValueChangeFromPath,
    propPathToArray,
    propValueFromPath,
    propValueMoveArrayItem,
    propValueRemoveArrayItem,
    propValuesFromSchema,
} from '@bcms/selfhosted-ui/util/prop';
import type { PropValueDateData } from '@bcms/selfhosted-backend/prop/models/date';
import type { PropValueMediaData } from '@bcms/selfhosted-backend/prop/models/media';
import type { PropValueRichTextData } from '@bcms/selfhosted-backend/prop/models/rich-text';
import type { PropValueGroupPointerData } from '@bcms/selfhosted-backend/prop/models/group-pointer';
import type { PropValueEntryPointer } from '@bcms/selfhosted-backend/prop/models/entry-pointer';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import type { Entry } from '@bcms/selfhosted-backend/entry/models/main';
import type { PropValidator } from '@bcms/selfhosted-ui/util/prop-validation';
import type { EntrySync } from '@bcms/selfhosted-ui/services/entry-sync';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@bcms/selfhosted-ui/util/sub';
import { TextAreaInput } from '@bcms/selfhosted-ui/components/inputs/text-area';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import { StringUtility } from '@bcms/selfhosted-utils/string-utility';
import { EntryMetaEditor } from '@bcms/selfhosted-ui/components/entry/meta';
import { EntryContentEditor } from '@bcms/selfhosted-ui/components/entry/content';

export async function entryEditorMetaOnAddPropValue(
    props: PropValue[],
    pathParts: (string | number)[],
    prop: Prop,
) {
    const value = propValueFromPath(pathParts, props);
    if (value) {
        switch (prop.type) {
            case 'STRING':
                {
                    (value.data as string[]).push('');
                }
                break;
            case 'NUMBER':
                {
                    (value.data as number[]).push(0);
                }
                break;
            case 'BOOLEAN':
                {
                    (value.data as boolean[]).push(false);
                }
                break;
            case 'DATE':
                {
                    (value.data as PropValueDateData[]).push({
                        timestamp: -1,
                        timezoneOffset: new Date().getTimezoneOffset(),
                    });
                }
                break;
            case 'ENUMERATION':
                {
                    (value.data as string[]).push('');
                }
                break;
            case 'MEDIA':
                {
                    (value.data as PropValueMediaData[]).push({
                        _id: '',
                    });
                }
                break;
            case 'RICH_TEXT':
                {
                    (value.data as PropValueRichTextData[]).push({
                        nodes: [],
                    });
                }
                break;
            case 'GROUP_POINTER':
                {
                    const sdk = window.bcms.sdk;
                    const throwable = window.bcms.throwable;
                    const data = value.data as PropValueGroupPointerData;
                    await throwable(async () => {
                        const group = await sdk.group.get({
                            groupId: data._id,
                        });
                        data.items.push({
                            props: await propValuesFromSchema(group.props),
                        });
                    });
                }
                break;
            case 'ENTRY_POINTER':
                {
                    (value.data as PropValueEntryPointer[]).push({
                        eid: '',
                        tid: '',
                    });
                }
                break;
        }
    }
}

export const EntryEditor = defineComponent({
    props: {
        ...DefaultComponentProps,
        entry: {
            type: Object as PropType<Entry>,
            required: true,
        },
        propValidator: {
            type: Object as PropType<PropValidator>,
            required: true,
        },
        entrySync: {
            type: Object as PropType<EntrySync>,
            required: false,
        },
    },
    emits: {
        editTitle: (_value: string) => {
            return true;
        },
        editSlug: (_value: string) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const template = computed(() =>
            sdk.store.template.findById(props.entry.templateId),
        );
        const [lngCode] = window.bcms.useLanguage();
        const lngIdx = computed(() => {
            const idx = props.entry.meta.findIndex(
                (e) => e.lng === lngCode.value,
            );
            if (typeof idx === 'undefined') {
                return -1;
            }
            return idx;
        });
        const unsubs: UnsubscribeFns = [];
        const inputErrors = ref({
            title: '',
            slug: '',
        });

        onMounted(async () => {
            unsubs.push(
                // Validate title
                props.propValidator.register(() => {
                    if (
                        !(
                            props.entry.meta[lngIdx.value].props[0]
                                .data as string[]
                        )[0]
                    ) {
                        inputErrors.value.title = 'Title is required';
                        return false;
                    }
                    inputErrors.value.title = '';
                    return true;
                }),
                // Validate slug
                props.propValidator.register(() => {
                    if (
                        !(
                            props.entry.meta[lngIdx.value].props[1]
                                .data as string[]
                        )[0]
                    ) {
                        inputErrors.value.slug = 'Slug is required';
                        return false;
                    }
                    inputErrors.value.slug = '';
                    return true;
                }),
            );
            await window.bcms.throwable(async () => {
                await sdk.template.getAll();
                return { languages: await sdk.language.getAll() };
            });
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(unsubs);
        });

        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`${props.class || ''}`}
            >
                {template.value && lngCode.value && lngIdx.value !== -1 ? (
                    <div class={`flex flex-col gap-2 max-w-[600px]`}>
                        <div
                            class={`bg-light/50 dark:bg-darkGray/50 rounded-xl border border-gray/50 dark:border-gray p-5 mb-10`}
                        >
                            <TextAreaInput
                                id={`entry.meta.${lngIdx.value}.props.0.data.0`}
                                entrySync={props.entrySync}
                                label="Title"
                                placeholder="Title"
                                error={inputErrors.value.title}
                                required
                                value={
                                    (
                                        props.entry.meta[lngIdx.value].props[0]
                                            .data as string[]
                                    )[0]
                                }
                                onInput={(value) => {
                                    ctx.emit('editTitle', value);
                                }}
                            />
                            <TextInput
                                id={`entry.meta.${lngIdx.value}.props.1.data.0`}
                                class={`mt-4 mb-4`}
                                label="Slug"
                                placeholder="Slug"
                                required
                                entrySync={props.entrySync}
                                error={inputErrors.value.slug}
                                value={
                                    (
                                        props.entry.meta[lngIdx.value].props[1]
                                            .data as string[]
                                    )[0]
                                }
                                onInput={(value, event) => {
                                    value = StringUtility.toSlug(value);
                                    if (event) {
                                        const el =
                                            event.target as HTMLInputElement;
                                        if (el) {
                                            el.value = value;
                                        }
                                    }
                                    ctx.emit('editSlug', value);
                                }}
                            />
                            <EntryMetaEditor
                                propPath={`entry.meta.${lngIdx.value}.props`}
                                props={template.value?.props.slice(2)}
                                propsIdxOffset={2}
                                values={props.entry.meta[lngIdx.value].props}
                                lngCode={lngCode.value}
                                lngIdx={lngIdx.value}
                                entryId={props.entry._id}
                                propValidator={props.propValidator}
                                entrySync={props.entrySync}
                                onEditProp={(propPath, value) => {
                                    const pathParts = propPathToArray(propPath);
                                    propApplyValueChangeFromPath(
                                        pathParts.slice(4),
                                        props.entry.meta[lngIdx.value].props,
                                        value,
                                    );
                                }}
                                onAddValue={async (propPath, prop) => {
                                    const pathParts = propPathToArray(propPath);
                                    await entryEditorMetaOnAddPropValue(
                                        props.entry.meta[lngIdx.value].props,
                                        pathParts.slice(4),
                                        prop,
                                    );
                                }}
                                onRemoveArrayItem={(propPath) => {
                                    propValueRemoveArrayItem(
                                        propPathToArray(propPath).slice(4),
                                        props.entry.meta[lngIdx.value].props,
                                    );
                                }}
                                onMoveArrayItem={(propPath, direction) => {
                                    propValueMoveArrayItem(
                                        propPathToArray(propPath).slice(4),
                                        props.entry.meta[lngIdx.value].props,
                                        direction,
                                    );
                                }}
                            />
                        </div>
                        <div>
                            <EntryContentEditor
                                nodes={props.entry.content[lngIdx.value].nodes}
                                placeholder="Click and start typing, use / for commands"
                                propPath={`entry.content.${lngIdx.value}.nodes`}
                                lngIdx={lngIdx.value}
                                entryId={props.entry._id}
                                entrySync={props.entrySync}
                                onInput={(nodes) => {
                                    // eslint-disable-next-line vue/no-mutating-props
                                    props.entry.content[lngIdx.value].nodes =
                                        nodes;
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    ''
                )}
            </div>
        );
    },
});
