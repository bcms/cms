import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
} from 'vue';
import type {
    Prop,
    PropValue,
} from '@thebcms/selfhosted-backend/prop/models/main';
import type { PropValidator } from '@thebcms/selfhosted-ui/util/prop-validation';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import type { PropValueGroupPointerData } from '@thebcms/selfhosted-backend/prop/models/group-pointer';
import { EntryMetaEditor } from '@thebcms/selfhosted-ui/components/entry/meta';
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@thebcms/selfhosted-ui/components/prop/_input-wrapper';

export const PropGroupPointerInput = defineComponent({
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
        lngCode: {
            type: String,
            required: true,
        },
        lngIdx: {
            type: Number,
            required: true,
        },
        entryId: {
            type: String,
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
        editProp: (_propPath: string, _value: unknown) => {
            return true;
        },
        addValue: (_propPath: string, _prop: Prop) => {
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
        const sdk = window.bcms.sdk;
        const group = computed(() =>
            sdk.store.group.findById(
                props.prop.data.propGroupPointer?._id || '',
            ),
        );
        const unsubs: Array<() => void> = [];

        function getEntryMetaEditor(
            groupPointerValue: PropValueGroupPointerData,
            valueItemIdx: number,
        ) {
            return (
                <EntryMetaEditor
                    propPath={
                        props.propPath + `.data.items.${valueItemIdx}.props`
                    }
                    props={(group.value as Group).props}
                    values={groupPointerValue.items[valueItemIdx]?.props || []}
                    lngIdx={props.lngIdx}
                    lngCode={props.lngCode}
                    entryId={props.entryId}
                    propValidator={props.propValidator}
                    propDepth={props.propDepth + 1}
                    entrySync={props.entrySync}
                    onEditProp={(propPath, value) => {
                        ctx.emit('editProp', propPath, value);
                    }}
                    onAddValue={(propPath, prop) => {
                        ctx.emit('addValue', propPath, prop);
                    }}
                    onRemoveArrayItem={(propPath) => {
                        ctx.emit('removeArrayItem', propPath);
                    }}
                />
            );
        }

        /**
         * Retrieves the single item's data based on the provided props.
         *
         * @returns
         *     - If the prop is required, returns the editor for the single item's data
         *     - If the prop is not required and no data exists, returns a button to add data
         *     - If the prop is not required and data exists, returns a button to remove data and the editor
         */
        function getSingleItemData() {
            const data = props.value.data as PropValueGroupPointerData;
            if (props.prop.required) {
                return getEntryMetaEditor(data, 0);
            } else {
                if (data.items.length === 0) {
                    return (
                        <Button
                            onClick={() => {
                                ctx.emit(
                                    'addValue',
                                    props.propPath,
                                    props.prop,
                                );
                                props.entrySync?.emitGroupPointerUpdate({
                                    propPath: props.propPath,
                                    add: true,
                                });
                            }}
                        >
                            Add data to {props.prop.label}
                        </Button>
                    );
                } else {
                    return (
                        <>
                            <Button
                                onClick={() => {
                                    ctx.emit(
                                        'removeArrayItem',
                                        props.propPath + `.data.items.0`,
                                    );
                                    props.entrySync?.emitGroupPointerUpdate({
                                        propPath: props.propPath,
                                        remove: 0,
                                    });
                                }}
                            >
                                Remove data from {props.prop.label}
                            </Button>
                            {getEntryMetaEditor(data, 0)}
                        </>
                    );
                }
            }
        }

        onMounted(() => {
            if (props.entrySync) {
                unsubs.push(
                    props.entrySync.onGroupPointerUpdate(
                        props.propPath,
                        async (data) => {
                            if (data.add) {
                                ctx.emit(
                                    'addValue',
                                    props.propPath,
                                    props.prop,
                                );
                            } else if (typeof data.remove === 'number') {
                                const propPath =
                                    data.propPath +
                                    `.data.items.${data.remove}`;
                                ctx.emit('removeArrayItem', propPath);
                            } else if (data.move) {
                                const propPath =
                                    data.propPath +
                                    `.data.items.${data.move[0]}`;
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

        onBeforeUnmount(() => {
            unsubs.forEach((e) => e());
        });

        return () => (
            <>
                {group.value && (
                    <PropInputWrapper
                        id={props.propPath}
                        label={props.prop.label}
                        required={props.prop.required}
                        array={props.prop.array}
                        propDepth={props.propDepth}
                        isGroup
                        onAddArrayItem={() => {
                            ctx.emit('addValue', props.propPath, props.prop);
                            props.entrySync?.emitGroupPointerUpdate({
                                propPath: props.propPath,
                                add: true,
                            });
                        }}
                    >
                        {props.prop.array ? (
                            <>
                                {(
                                    props.value
                                        .data as PropValueGroupPointerData
                                ).items.map((_valueItem, valueItemIdx) => {
                                    return (
                                        <PropInputWrapperArrayItem
                                            label="Item"
                                            id={
                                                props.propPath +
                                                `.data.items.${valueItemIdx}`
                                            }
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
                                                    `.data.items.${valueItemIdx}`;
                                                ctx.emit(
                                                    'removeArrayItem',
                                                    propPath,
                                                );
                                                props.entrySync?.emitGroupPointerUpdate(
                                                    {
                                                        propPath:
                                                            props.propPath,
                                                        remove: valueItemIdx,
                                                    },
                                                );
                                            }}
                                            onMove={(direction) => {
                                                const propPath =
                                                    props.propPath +
                                                    `.data.items.${valueItemIdx}`;
                                                ctx.emit(
                                                    'moveArrayItem',
                                                    propPath,
                                                    direction,
                                                );
                                                const move: [number, number] = [
                                                    valueItemIdx,
                                                    direction,
                                                ];
                                                props.entrySync?.emitGroupPointerUpdate(
                                                    {
                                                        propPath:
                                                            props.propPath,
                                                        move,
                                                    },
                                                );
                                            }}
                                        >
                                            {getEntryMetaEditor(
                                                props.value
                                                    .data as PropValueGroupPointerData,
                                                valueItemIdx,
                                            )}
                                        </PropInputWrapperArrayItem>
                                    );
                                })}
                            </>
                        ) : (
                            getSingleItemData()
                        )}
                    </PropInputWrapper>
                )}
            </>
        );
    },
});
