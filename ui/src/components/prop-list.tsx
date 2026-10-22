import { defineComponent, type PropType, ref } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import type { Prop } from '@bcms/selfhosted-backend/prop/models/main';
import { Link } from '@bcms/selfhosted-ui/components/link';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import { Tag } from '@bcms/selfhosted-ui/components/tag';
import { useI18n } from 'vue-i18n';

const PROP_TYPE_LABEL_KEYS: Record<string, string> = {
    STRING: 'props.type.string',
    RICH_TEXT: 'props.type.richText',
    NUMBER: 'props.type.number',
    DATE: 'props.type.date',
    BOOLEAN: 'props.type.boolean',
    ENUMERATION: 'props.type.enumeration',
    MEDIA: 'props.type.media',
    GROUP_POINTER: 'props.type.groupPointer',
    ENTRY_POINTER: 'props.type.entryPointer',
};

export const PropList = defineComponent({
    props: {
        ...DefaultComponentProps,
        items: {
            type: Array as PropType<Prop[]>,
            required: true,
        },
        uneditable: Boolean,
    },
    emits: {
        move: (_prop: Prop, _direction: number) => {
            return true;
        },
        remove: (_prop: Prop) => {
            return true;
        },
        edit: (_prop: Prop) => {
            return true;
        },
    },
    setup(props, ctx) {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;

        const showOptions = ref<{
            [id: string]: boolean;
        }>({});
        let dragInfo: {
            prop: Prop;
            dropAt: HTMLElement;
        } | null = null;

        function findParentPropAfterDrop(el?: HTMLElement | null): Prop | null {
            if (!el) {
                return null;
            }
            if (el.getAttribute('data-bcms-metadata') === 'prop_item') {
                return props.items.find((e) => e.id === el.id) as Prop;
            } else {
                return findParentPropAfterDrop(el.parentElement);
            }
        }

        function getGroupPointerLink(groupId: string) {
            const group = sdk.store.group.findById(groupId);
            if (!group) {
                return <></>;
            }
            return (
                <Link
                    class={`flex gap-2 items-center text-brand-600`}
                    href={`/d/group/${group._id}`}
                >
                    <Icon class={`stroke-brand-600`} src={'/link'} />
                    <div>{group?.label}</div>
                </Link>
            );
        }

        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`flex flex-col gap-3 ${props.class || ''}`}
            >
                {props.items.map((prop) => {
                    return (
                        <div
                            id={prop.id}
                            data-bcms-metadata={'prop_item'}
                            class={`relative flex flex-col sm:flex-row gap-4 py-4 px-6 bg-white dark:bg-darkGray rounded-2.5 border border-gray dark:border-gray`}
                            draggable={!props.uneditable}
                            onMouseenter={() => {
                                if (!props.uneditable) {
                                    showOptions.value[prop.id] = true;
                                }
                            }}
                            onMouseleave={() => {
                                if (!props.uneditable) {
                                    showOptions.value[prop.id] = false;
                                }
                            }}
                            onDragover={(event) => {
                                if (!props.uneditable) {
                                    dragInfo = {
                                        prop,
                                        dropAt: event.target as HTMLElement,
                                    };
                                }
                            }}
                            onDragend={() => {
                                if (!props.uneditable) {
                                    const targetProp = findParentPropAfterDrop(
                                        dragInfo?.dropAt,
                                    );
                                    if (targetProp) {
                                        const found = [false, false];
                                        let targetIdx = 0;
                                        let originIdx = 0;
                                        for (
                                            let i = 0;
                                            i < props.items.length;
                                            i++
                                        ) {
                                            if (props.items[i].id === prop.id) {
                                                originIdx = i;
                                                found[0] = true;
                                            }
                                            if (
                                                props.items[i].id ===
                                                dragInfo?.prop.id
                                            ) {
                                                targetIdx = i;
                                                found[1] = true;
                                            }
                                        }
                                        if (found[0] && found[1]) {
                                            const direction =
                                                targetIdx - originIdx;
                                            ctx.emit('move', prop, direction);
                                        }
                                    }
                                    showOptions.value[prop.id] = false;
                                }
                            }}
                        >
                            <button
                                class={`${
                                    showOptions.value[prop.id]
                                        ? ''
                                        : 'opacity-0'
                                } cursor-pointer absolute left-[-30px] top-0 h-full p-3`}
                            >
                                <Icon
                                    class={`w-4 h-4 fill-current text-green dark:text-yellow`}
                                    src={`/more-vertical`}
                                />
                            </button>
                            <div class={`flex flex-col gap-2`}>
                                <div class={`flex flex-wrap gap-2 items-center`}>
                                    <Icon
                                        class={`w-3 h-3 fill-current text-gray dark:text-gray`}
                                        src={
                                            prop.required ? '/lock' : '/unlock'
                                        }
                                    />
                                    <div class={`font-medium`}>
                                        {prop.label}
                                    </div>
                                    <div class={`min-w-0 break-all text-sm text-darkGray dark:text-gray`}>
                                        {t('props.fieldKey')}: {prop.name}
                                    </div>
                                </div>
                                <button
                                    class={`flex gap-2 items-center text-darkGray dark:text-gray text-xs`}
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(
                                            prop.id,
                                        );
                                        notification.success(
                                            t('props.copyIdSuccess'),
                                        );
                                    }}
                                >
                                    <div>
                                        <Icon
                                            class={`w-3 h-3 fill-current text-gray`}
                                            src={'/link'}
                                        />
                                    </div>
                                    <div class={`text-left`}>{prop.id}</div>
                                </button>
                            </div>
                            <Tag class={'mt-auto mb-auto'}>
                                {t(
                                    PROP_TYPE_LABEL_KEYS[prop.type] ||
                                        prop.type,
                                )}
                                {prop.array ? ' ' + t('props.array') : ''}
                            </Tag>
                            {prop.type === 'GROUP_POINTER'
                                ? getGroupPointerLink(
                                      prop.data.propGroupPointer?._id || '',
                                  )
                                : ''}
                            {showOptions.value[prop.id] && (
                                <div class={`ml-auto flex gap-4 items-center`}>
                                    <button
                                        class={`p-2`}
                                        onClick={() => {
                                            ctx.emit('edit', prop);
                                            // ModalService.propEdit.show({
                                            //     title: `Edit property ${prop.label}`,
                                            //     props: props.items,
                                            //     prop,
                                            //     async onDone(change) {
                                            //         ctx.emit(
                                            //             'edit',
                                            //             change,
                                            //             prop,
                                            //         );
                                            //     },
                                            // });
                                        }}
                                    >
                                        <Icon
                                            class={`w-4 h-4 fill-current text-green dark:text-yellow`}
                                            src={`/edit-03`}
                                        />
                                    </button>
                                    <button
                                        class={`p-2`}
                                        onClick={async () => {
                                            if (
                                                await confirm(
                                                    t('props.delete'),
                                                    t('props.deleteConfirm', {
                                                        name: prop.name,
                                                    }),
                                                )
                                            ) {
                                                ctx.emit('remove', prop);
                                            }
                                        }}
                                    >
                                        <Icon
                                            class={`w-4 h-4 fill-current text-red`}
                                            src={`/trash`}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    },
});
