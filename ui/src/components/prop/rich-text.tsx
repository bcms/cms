import {
    defineComponent,
    onBeforeUnmount,
    onBeforeUpdate,
    onMounted,
    type PropType,
    ref,
} from 'vue';
import type {
    Prop,
    PropValue,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { PropValidator } from '@thebcms/selfhosted-ui/util/prop-validation';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import type { PropValueRichTextData } from '@thebcms/selfhosted-backend/prop/models/rich-text';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@thebcms/selfhosted-ui/util/sub';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@thebcms/selfhosted-ui/components/prop/_input-wrapper';
import { InputWrapper } from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import { EntryContentEditor } from '@thebcms/selfhosted-ui/components/entry/content';

export const PropRichTextInput = defineComponent({
    props: {
        propPath: {
            type: String,
            required: true,
        },
        entryId: {
            type: String,
            required: true,
        },
        prop: {
            type: Object as PropType<Prop>,
            required: true,
        },
        value: {
            type: Object as PropType<PropValue>,
            required: true,
        },
        propValidator: {
            type: Object as PropType<PropValidator>,
            required: true,
        },
        lngIdx: {
            type: Number,
            required: true,
        },
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        edit: (_propPath: string, _value: PropValueRichTextData) => {
            return true;
        },
        addValue: (_propPath: string) => {
            return true;
        },
        removeArrayItem: (_propPath: string) => {
            return true;
        },
        moveArrayItem: (_propPath: string, _direction: number) => {
            return true;
        },
    },
    setup(props, ctx) {
        const errorUnsubs: UnsubscribeFns = [];
        const entrySyncUnsubs: UnsubscribeFns = [];
        const errors = ref<string[]>([]);

        function validate(itemIdx: number): boolean {
            const valueData = props.value.data as PropValueRichTextData[];
            if (!valueData[itemIdx] || valueData[itemIdx].nodes.length === 0) {
                errors.value[itemIdx] =
                    'Property is required, please enter some text';
                return false;
            }
            errors.value[itemIdx] = '';
            return true;
        }

        function initializeErrors(itemCount: number) {
            callAndClearUnsubscribeFns(errorUnsubs);
            errors.value = [];
            if (props.prop.required) {
                if (props.prop.array) {
                    for (let i = 0; i < itemCount; i++) {
                        errors.value.push('');
                        errorUnsubs.push(
                            props.propValidator.register(() => {
                                return validate(i);
                            }),
                        );
                    }
                } else {
                    errors.value.push('');
                    errorUnsubs.push(
                        props.propValidator.register(() => {
                            return validate(0);
                        }),
                    );
                }
            }
        }

        onMounted(() => {
            initializeErrors(
                (props.value.data as PropValueRichTextData[]).length,
            );
            if (props.entrySync) {
                entrySyncUnsubs.push(
                    props.entrySync.onRichTextUpdate(
                        props.propPath,
                        async (data) => {
                            if (data.add) {
                                ctx.emit('addValue', data.propPath);
                                initializeErrors(
                                    (props.value.data as string[]).length + 1,
                                );
                            } else if (typeof data.remove !== 'undefined') {
                                const propPath =
                                    props.propPath + `.data.${data.remove}`;
                                ctx.emit('removeArrayItem', propPath);
                                initializeErrors(
                                    (props.value.data as string[]).length - 1,
                                );
                            } else if (data.move) {
                                const propPath =
                                    props.propPath + `.data.${data.move[0]}`;
                                ctx.emit(
                                    'moveArrayItem',
                                    propPath,
                                    data.move[1],
                                );
                            }
                        },
                    ),
                );
            }
        });

        onBeforeUpdate(() => {
            const valueData = props.value.data as string[];
            if (valueData.length !== errors.value.length) {
                initializeErrors(valueData.length);
            }
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(errorUnsubs);
            callAndClearUnsubscribeFns(entrySyncUnsubs);
        });

        return () => (
            <PropInputWrapper
                id={props.propPath}
                label={props.prop.label}
                required={props.prop.required}
                array={props.prop.array}
                onAddArrayItem={() => {
                    initializeErrors((props.value.data as string[]).length + 1);
                    ctx.emit('addValue', props.propPath);
                    props.entrySync?.emitRichTextUpdate({
                        propPath: props.propPath,
                        add: true,
                    });
                }}
            >
                {props.prop.array ? (
                    <>
                        {(props.value.data as PropValueRichTextData[]).map(
                            (valueItem, valueItemIdx) => {
                                return (
                                    <PropInputWrapperArrayItem
                                        id={
                                            props.propPath +
                                            `.data.${valueItemIdx}`
                                        }
                                        label="Item"
                                        itemIdx={valueItemIdx}
                                        initialExtended={true}
                                        disableMoveUp={valueItemIdx === 0}
                                        disableMoveDown={
                                            valueItemIdx ===
                                            (props.value.data as string[])
                                                .length -
                                                1
                                        }
                                        onDelete={() => {
                                            initializeErrors(
                                                (props.value.data as string[])
                                                    .length + 1,
                                            );
                                            const propPath =
                                                props.propPath +
                                                `.data.${valueItemIdx}`;
                                            ctx.emit(
                                                'removeArrayItem',
                                                propPath,
                                            );
                                            /**
                                             * Timeout is required because delete event needs to
                                             * occur after y.js sync event.
                                             */
                                            setTimeout(() => {
                                                props.entrySync?.emitRichTextUpdate(
                                                    {
                                                        propPath:
                                                            props.propPath,
                                                        remove:
                                                            (
                                                                props.value
                                                                    .data as string[]
                                                            ).length - 1,
                                                    },
                                                );
                                            }, 100);
                                        }}
                                        onMove={(direction) => {
                                            const propPath =
                                                props.propPath +
                                                `.data.${valueItemIdx}`;
                                            ctx.emit(
                                                'moveArrayItem',
                                                propPath,
                                                direction,
                                            );
                                            /**
                                             * Direct move event is not required because it is
                                             * handled by the y.js
                                             */
                                        }}
                                    >
                                        <InputWrapper
                                            id={
                                                props.propPath +
                                                `.data.${valueItemIdx}`
                                            }
                                            error={errors.value[valueItemIdx]}
                                        >
                                            <div
                                                class={`bg-light dark:bg-darkGray border border-gray/50 dark:border-gray px-4 py-3 rounded-2xl`}
                                            >
                                                <EntryContentEditor
                                                    id={
                                                        props.propPath +
                                                        `.data.${valueItemIdx}`
                                                    }
                                                    class='bcmsRichText'
                                                    propPath={
                                                        props.propPath +
                                                        `.data.${valueItemIdx}`
                                                    }
                                                    placeholder={
                                                        props.prop.label
                                                    }
                                                    nodes={valueItem.nodes}
                                                    lngIdx={props.lngIdx}
                                                    entryId={props.entryId}
                                                    entrySync={props.entrySync}
                                                    onInput={(value) => {
                                                        ctx.emit(
                                                            'edit',
                                                            props.propPath +
                                                                `.data.${valueItemIdx}`,
                                                            {
                                                                nodes: value,
                                                            },
                                                        );
                                                    }}
                                                />
                                            </div>
                                        </InputWrapper>
                                    </PropInputWrapperArrayItem>
                                );
                            },
                        )}
                    </>
                ) : (
                    <InputWrapper
                        id={props.propPath + `.data.0`}
                        error={errors.value[0]}
                    >
                        <div
                            class={`bg-light dark:bg-darkGray border border-gray/50 dark:border-gray px-4 py-3 rounded-2xl min-h-[unset] max-h-[unset] h-auto`}
                        >
                            <EntryContentEditor
                                class='bcmsRichText'
                                id={props.propPath + `.data.0`}
                                propPath={props.propPath + `.data.0`}
                                placeholder={props.prop.label}
                                nodes={
                                    (
                                        props.value
                                            .data as PropValueRichTextData[]
                                    )[0].nodes
                                }
                                allowedWidgets={[]}
                                lngIdx={props.lngIdx}
                                entryId={props.entryId}
                                entrySync={props.entrySync}
                                onInput={(value) => {
                                    ctx.emit(
                                        'edit',
                                        props.propPath + `.data.0`,
                                        {
                                            nodes: value,
                                        },
                                    );
                                }}
                            />
                        </div>
                    </InputWrapper>
                )}
            </PropInputWrapper>
        );
    },
});
