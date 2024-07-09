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
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@thebcms/selfhosted-ui/util/sub';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@thebcms/selfhosted-ui/components/prop/_input-wrapper';
import { TextAreaInput } from '@thebcms/selfhosted-ui/components/inputs/text-area';

export const PropStringInput = defineComponent({
    props: {
        propPath: {
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
        propDepth: {
            type: Number,
            default: 0,
        },
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        edit: (_propPath: string, _value: string) => {
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

        function initializeErrors(itemCount: number) {
            callAndClearUnsubscribeFns(errorUnsubs);
            const valueData = props.value.data as string[];
            errors.value = [];
            if (props.prop.required) {
                if (props.prop.array) {
                    for (let i = 0; i < itemCount; i++) {
                        errors.value.push('');
                        errorUnsubs.push(
                            props.propValidator.register(() => {
                                if (!valueData[i]) {
                                    errors.value[i] =
                                        'Property is required, please enter some text';
                                    return false;
                                }
                                errors.value[i] = '';
                                return true;
                            }),
                        );
                    }
                } else {
                    errors.value.push('');
                    errorUnsubs.push(
                        props.propValidator.register(() => {
                            if (!valueData[0]) {
                                errors.value[0] =
                                    'Property is required, please enter some text';
                                return false;
                            }
                            errors.value[0] = '';
                            return true;
                        }),
                    );
                }
            }
        }

        onMounted(() => {
            initializeErrors((props.value.data as string[]).length);
            if (props.entrySync) {
                entrySyncUnsubs.push(
                    props.entrySync.onStringUpdate(
                        props.propPath,
                        async (data) => {
                            if (data.add) {
                                initializeErrors(
                                    (props.value.data as string[]).length + 1,
                                );
                                ctx.emit('addValue', data.propPath);
                            } else if (typeof data.remove === 'number') {
                                initializeErrors(
                                    (props.value.data as string[]).length - 1,
                                );
                                const propPath =
                                    props.propPath + `.data.${data.remove}`;
                                ctx.emit('removeArrayItem', propPath);
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
                propDepth={props.propDepth}
                onAddArrayItem={() => {
                    initializeErrors((props.value.data as string[]).length + 1);
                    ctx.emit('addValue', props.propPath);
                    props.entrySync?.emitStringUpdate({
                        propPath: props.propPath,
                        add: true,
                    });
                }}
            >
                {props.prop.array ? (
                    <>
                        {(props.value.data as string[]).map(
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
                                                props.entrySync?.emitStringUpdate(
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
                                        <TextAreaInput
                                            id={
                                                props.propPath +
                                                `.data.${valueItemIdx}`
                                            }
                                            placeholder={props.prop.label}
                                            value={valueItem}
                                            error={errors.value[valueItemIdx]}
                                            entrySync={props.entrySync}
                                            onInput={(value) => {
                                                ctx.emit(
                                                    'edit',
                                                    props.propPath +
                                                        `.data.${valueItemIdx}`,
                                                    value,
                                                );
                                            }}
                                        />
                                    </PropInputWrapperArrayItem>
                                );
                            },
                        )}
                    </>
                ) : (
                    <TextAreaInput
                        id={props.propPath + `.data.0`}
                        placeholder={props.prop.label}
                        value={(props.value.data as string[])[0]}
                        error={errors.value[0]}
                        entrySync={props.entrySync}
                        onInput={(value) => {
                            ctx.emit('edit', props.propPath + `.data.0`, value);
                        }}
                    />
                )}
            </PropInputWrapper>
        );
    },
});
