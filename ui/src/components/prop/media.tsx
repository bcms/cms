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
import type { PropValueMediaData } from '@thebcms/selfhosted-backend/prop/models/media';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@thebcms/selfhosted-ui/util/sub';
import {
    PropInputWrapper,
    PropInputWrapperArrayItem,
} from '@thebcms/selfhosted-ui/components/prop/_input-wrapper';
import { MediaSelect } from '@thebcms/selfhosted-ui/components/inputs/select/media';

export const PropMediaInput = defineComponent({
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
        edit: (_propPath: string, _value: PropValueMediaData) => {
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
            errors.value = [];
            if (props.prop.required) {
                if (props.prop.array) {
                    for (let i = 0; i < itemCount; i++) {
                        errors.value.push('');
                        errorUnsubs.push(
                            props.propValidator.register(() => {
                                const valueData = props.value
                                    .data as PropValueMediaData[];
                                if (!valueData[i]?._id) {
                                    errors.value[i] =
                                        'Property is required, please select a media file';
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
                            const valueData = props.value
                                .data as PropValueMediaData[];
                            if (!valueData[0]?._id) {
                                errors.value[0] =
                                    'Property is required, please select a media file';
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
            initializeErrors((props.value.data as PropValueMediaData[]).length);
            if (props.entrySync) {
                entrySyncUnsubs.push(
                    props.entrySync.onMediaUpdate(
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
            const valueData = props.value.data as PropValueMediaData[];
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
                    props.entrySync?.emitMediaUpdate({
                        propPath: props.propPath,
                        add: true,
                    });
                }}
            >
                {props.prop.array ? (
                    <>
                        {(props.value.data as PropValueMediaData[]).map(
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
                                            props.entrySync?.emitMediaUpdate({
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
                                            props.entrySync?.emitMediaUpdate({
                                                propPath: props.propPath,
                                                move,
                                            });
                                        }}
                                    >
                                        <MediaSelect
                                            id={
                                                props.propPath +
                                                `.data.${valueItemIdx}`
                                            }
                                            mediaId={valueItem._id}
                                            altText={valueItem.alt_text}
                                            caption={valueItem.caption}
                                            error={errors.value[valueItemIdx]}
                                            entrySync={props.entrySync}
                                            onChange={(data, byEntrySync) => {
                                                const propPath =
                                                    props.propPath +
                                                    `.data.${valueItemIdx}`;
                                                ctx.emit('edit', propPath, {
                                                    _id: data?.media._id || '',
                                                    caption:
                                                        data?.caption || '',
                                                    alt_text:
                                                        data?.altText || '',
                                                });
                                                if (!byEntrySync) {
                                                    props.entrySync?.emitMediaUpdate(
                                                        {
                                                            propPath,
                                                            value: {
                                                                _id:
                                                                    data?.media
                                                                        ._id ||
                                                                    '',
                                                                alt_text:
                                                                    data?.altText ||
                                                                    '',
                                                                caption:
                                                                    data?.caption ||
                                                                    '',
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
                    <MediaSelect
                        id={props.propPath + `.data.0`}
                        error={errors.value[0]}
                        entrySync={props.entrySync}
                        mediaId={
                            (props.value.data as PropValueMediaData[])[0]
                                ? (props.value.data as PropValueMediaData[])[0]
                                      ._id
                                : ''
                        }
                        altText={
                            (props.value.data as PropValueMediaData[])[0]
                                ? (props.value.data as PropValueMediaData[])[0]
                                      .alt_text
                                : undefined
                        }
                        caption={
                            (props.value.data as PropValueMediaData[])[0]
                                ? (props.value.data as PropValueMediaData[])[0]
                                      .caption
                                : undefined
                        }
                        onChange={(data, byEntrySync) => {
                            const propPath = props.propPath + `.data.0`;
                            ctx.emit('edit', propPath, {
                                _id: data?.media._id || '',
                                caption: data?.caption || '',
                                alt_text: data?.altText || '',
                            });
                            if (!byEntrySync) {
                                props.entrySync?.emitMediaUpdate({
                                    propPath,
                                    value: {
                                        _id: data?.media._id || '',
                                        caption: data?.caption || '',
                                        alt_text: data?.altText || '',
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
