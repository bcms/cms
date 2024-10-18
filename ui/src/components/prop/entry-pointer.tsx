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
} from '@bcms/selfhosted-backend/prop/models/main';
import type { PropValidator } from '@bcms/selfhosted-ui/util/prop-validation';
import type { EntrySync } from '@bcms/selfhosted-ui/services/entry-sync';
import type { PropValueEntryPointer } from '@bcms/selfhosted-backend/prop/models/entry-pointer';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@bcms/selfhosted-ui/util/sub';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@bcms/selfhosted-ui/components/prop/_input-wrapper';
import { SelectEntryPointer } from '@bcms/selfhosted-ui/components/inputs/select/entry-pointer';

export const PropEntryPointerInput = defineComponent({
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
        edit: (_propPath: string, _value: PropValueEntryPointer) => {
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
                                        'Property is required, please select an entry';
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
                                errors.value[0] = `Property is required, please select an entry`;
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
                    props.entrySync.onEntryPointerUpdate(
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
                    props.entrySync?.emitEntryPointerUpdate({
                        propPath: props.propPath,
                        add: true,
                    });
                }}
            >
                {props.prop.array ? (
                    <>
                        {(props.value.data as PropValueEntryPointer[]).map(
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
                                            props.entrySync?.emitEntryPointerUpdate(
                                                {
                                                    propPath: props.propPath,
                                                    remove: valueItemIdx,
                                                },
                                            );
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
                                            props.entrySync?.emitEntryPointerUpdate(
                                                {
                                                    propPath: props.propPath,
                                                    move,
                                                },
                                            );
                                        }}
                                    >
                                        <SelectEntryPointer
                                            propPath={
                                                props.propPath +
                                                `.data.${valueItemIdx}`
                                            }
                                            placeholder={props.prop.label}
                                            allowedTemplates={
                                                props.prop.data.propEntryPointer?.map(
                                                    (e) => e.templateId,
                                                ) || undefined
                                            }
                                            selected={valueItem.eid}
                                            entrySync={props.entrySync}
                                            onChange={(event, byEntrySync) => {
                                                const data = {
                                                    eid: '',
                                                    tid: '',
                                                };
                                                if (
                                                    event._id !== valueItem.eid
                                                ) {
                                                    data.eid = event._id;
                                                    data.tid = event.templateId;
                                                }
                                                const propPath =
                                                    props.propPath +
                                                    `.data.${valueItemIdx}`;
                                                ctx.emit(
                                                    'edit',
                                                    propPath,
                                                    data,
                                                );
                                                if (!byEntrySync) {
                                                    props.entrySync?.emitEntryPointerUpdate(
                                                        {
                                                            propPath,
                                                            value: data,
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
                    <SelectEntryPointer
                        propPath={props.propPath + `.data.0`}
                        placeholder={props.prop.label}
                        allowedTemplates={
                            props.prop.data.propEntryPointer?.map(
                                (e) => e.templateId,
                            ) || undefined
                        }
                        selected={
                            (props.value.data as PropValueEntryPointer[])[0]
                                ?.eid
                        }
                        entrySync={props.entrySync}
                        onChange={(event, byEntrySync) => {
                            const data = {
                                eid: '',
                                tid: '',
                            };
                            if (
                                event._id !==
                                (props.value.data as PropValueEntryPointer[])[0]
                                    ?.eid
                            ) {
                                data.eid = event._id;
                                data.tid = event.templateId;
                            }
                            const propPath = props.propPath + `.data.0`;
                            ctx.emit('edit', propPath, data);
                            if (!byEntrySync) {
                                props.entrySync?.emitEntryPointerUpdate({
                                    propPath,
                                    value: data,
                                });
                            }
                        }}
                    />
                )}
            </PropInputWrapper>
        );
    },
});
