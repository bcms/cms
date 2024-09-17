import { defineComponent, onMounted, type PropType } from 'vue';
import type {
    Prop,
    PropValue,
} from '@bcms/selfhosted-backend/prop/models/main';
import type { EntrySync } from '@bcms/selfhosted-ui/services/entry-sync';
import type { UnsubscribeFns } from '@bcms/selfhosted-ui/util/sub';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@bcms/selfhosted-ui/components/prop/_input-wrapper';
import { Toggle } from '@bcms/selfhosted-ui/components/inputs/toggle';

export const PropBooleanInput = defineComponent({
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
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        edit: (_propPath: string, _value: boolean) => {
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
        const unsubs: UnsubscribeFns = [];

        onMounted(() => {
            if (props.entrySync) {
                unsubs.push(
                    props.entrySync.onBoolUpdate(
                        props.propPath,
                        async (data) => {
                            if (data.add) {
                                ctx.emit('addValue', props.propPath);
                            } else if (typeof data.remove === 'number') {
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

        return () => (
            <PropInputWrapper
                id={props.propPath}
                label={props.prop.label}
                required={props.prop.required}
                array={props.prop.array}
                onAddArrayItem={() => {
                    ctx.emit('addValue', props.propPath);
                    props.entrySync?.emitBoolUpdate({
                        propPath: props.propPath,
                        add: true,
                    });
                }}
            >
                {props.prop.array ? (
                    <>
                        {(props.value.data as boolean[]).map(
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
                                            (props.value.data as boolean[])
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
                                            props.entrySync?.emitBoolUpdate({
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
                                            props.entrySync?.emitBoolUpdate({
                                                propPath: props.propPath,
                                                move,
                                            });
                                        }}
                                    >
                                        <Toggle
                                            id={
                                                props.propPath +
                                                `.data.${valueItemIdx}`
                                            }
                                            label={props.prop.label}
                                            value={valueItem}
                                            entrySync={props.entrySync}
                                            onInput={(
                                                value,
                                                _,
                                                byEntrySync,
                                            ) => {
                                                const propPath =
                                                    props.propPath +
                                                    `.data.${valueItemIdx}`;
                                                ctx.emit(
                                                    'edit',
                                                    propPath,
                                                    value,
                                                );
                                                if (!byEntrySync) {
                                                    props.entrySync?.emitBoolUpdate(
                                                        {
                                                            propPath,
                                                            value,
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
                    <Toggle
                        id={props.propPath + `.data.0`}
                        label={props.prop.label}
                        value={(props.value.data as boolean[])[0]}
                        entrySync={props.entrySync}
                        onInput={(value, _, byEntrySync) => {
                            const propPath = props.propPath + `.data.0`;
                            ctx.emit('edit', propPath, value);
                            if (!byEntrySync) {
                                props.entrySync?.emitBoolUpdate({
                                    propPath,
                                    value,
                                });
                            }
                        }}
                    />
                )}
            </PropInputWrapper>
        );
    },
});
