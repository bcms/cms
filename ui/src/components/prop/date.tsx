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
import type { PropValueDateData } from '@thebcms/selfhosted-backend/prop/models/date';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@thebcms/selfhosted-ui/components/prop/_input-wrapper';
import { DateInput } from '@thebcms/selfhosted-ui/components/inputs/date';

export const PropDateInput = defineComponent({
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
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        edit: (_propPath: string, _value: number) => {
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
            const valueData = props.value.data as PropValueDateData[];
            errors.value = [];
            if (props.prop.required) {
                if (props.prop.array) {
                    for (let i = 0; i < itemCount; i++) {
                        errors.value.push('');
                        errorUnsubs.push(
                            props.propValidator.register(() => {
                                console.log({ ts: valueData[i].timestamp });
                                if (
                                    !valueData[i].timestamp ||
                                    valueData[i].timestamp === -1
                                ) {
                                    errors.value[i] =
                                        'Property is required, please enter a date';
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
                            if (
                                !valueData[0].timestamp ||
                                valueData[0].timestamp === -1
                            ) {
                                errors.value[0] =
                                    'Property is required, please enter a date';
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
                    props.entrySync.onDateUpdate(
                        props.propPath,
                        async (data) => {
                            if (data.add) {
                                ctx.emit('addValue', props.propPath);
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
            const valueData = props.value.data as PropValueDateData[];
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
                    props.entrySync?.emitDateUpdate({
                        propPath: props.propPath,
                        add: true,
                    });
                }}
            >
                {props.prop.array ? (
                    <>
                        {(props.value.data as PropValueDateData[]).map(
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
                                            props.entrySync?.emitDateUpdate({
                                                propPath: props.propPath,
                                                remove: valueItemIdx,
                                            });
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
                                            const move: [number, number] = [
                                                valueItemIdx,
                                                direction,
                                            ];
                                            props.entrySync?.emitDateUpdate({
                                                propPath: props.propPath,
                                                move,
                                            });
                                        }}
                                    >
                                        <DateInput
                                            id={
                                                props.propPath +
                                                `.data.${valueItemIdx}.timestamp`
                                            }
                                            placeholder={props.prop.label}
                                            value={valueItem.timestamp}
                                            error={errors.value[valueItemIdx]}
                                            entrySync={props.entrySync}
                                            onInput={(
                                                value,
                                                _,
                                                byEntrySync,
                                            ) => {
                                                const propPath =
                                                    props.propPath +
                                                    `.data.${valueItemIdx}.timestamp`;
                                                ctx.emit(
                                                    'edit',
                                                    propPath,
                                                    value,
                                                );
                                                if (!byEntrySync) {
                                                    props.entrySync?.emitDateUpdate(
                                                        {
                                                            propPath,
                                                            value: {
                                                                timestamp:
                                                                    value,
                                                                timezoneOffset: 0,
                                                            },
                                                        },
                                                    );
                                                }
                                            }}
                                        />
                                    </PropInputWrapperArrayItem>
                                );
                            },
                        )}
                    </>
                ) : (
                    <DateInput
                        id={props.propPath + `.data.0.timestamp`}
                        placeholder={props.prop.label}
                        value={
                            (props.value.data as PropValueDateData[])[0]
                                ?.timestamp
                        }
                        error={errors.value[0]}
                        entrySync={props.entrySync}
                        onInput={(value, _, byEntrySync) => {
                            const propPath =
                                props.propPath + `.data.0.timestamp`;
                            ctx.emit('edit', propPath, value);
                            if (!byEntrySync) {
                                props.entrySync?.emitDateUpdate({
                                    propPath,
                                    value: {
                                        timestamp: value,
                                        timezoneOffset: 0,
                                    },
                                });
                            }
                        }}
                    />
                )}
            </PropInputWrapper>
        );
    },
});
