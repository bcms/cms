import { v4 as uuidv4 } from 'uuid';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
} from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { findParent } from '@thebcms/selfhosted-ui/util/dom';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { Button } from '@thebcms/selfhosted-ui/components/button';

function findNodeById(el: HTMLElement, id: string) {
    if (el.id === id) {
        return el;
    } else if (el.parentElement) {
        return findNodeById(el.parentElement, id);
    }
    return null;
}

/**
 * Highlight only first node
 */
// function findNodeById(el: HTMLElement, id: string) {
//   if (el.id && el.getAttribute('data-bcms-prop-input-wrapper-array')) {
//     if (el.id === id) {
//       return el;
//     }
//     return null;
//   } else if (el.parentElement) {
//     return findNodeById(el.parentElement, id);
//   }
//   return null;
// }

export const PropInputWrapper = defineComponent({
    props: {
        ...DefaultComponentProps,
        label: {
            type: [String, Function] as PropType<string | (() => JSX.Element)>,
            required: true,
        },
        array: Boolean,
        required: Boolean,
        deletable: Boolean,
        collapsable: Boolean,
        isGroup: Boolean,
        propDepth: {
            type: Number,
            default: 0,
        },
    },
    emits: {
        delete: (_event: Event) => {
            return true;
        },
        addArrayItem: (_event: Event) => {
            return true;
        },
        focus: (_element: HTMLElement | null) => {
            return true;
        },
    },
    setup(props, ctx) {
        const id = uuidv4();
        const inFocus = ref(false);
        const hasFrame = computed(() => props.isGroup || props.array);

        function getLabel() {
            return typeof props.label === 'function'
                ? props.label()
                : props.label;
        }

        // function findNodeById(el: HTMLElement, id: string) {
        //   if (el.id && el.getAttribute('data-bcms-prop-input-wrapper')) {
        //     if (el.id === id) {
        //       return el;
        //     }
        //     return null;
        //   } else if (el.parentElement) {
        //     return findNodeById(el.parentElement, id);
        //   }
        //   return null;
        // }

        function highlight(event: Event) {
            const el = event.target as HTMLElement;
            if (el) {
                const inModalEl = findParent(el, (element) =>
                    element.getAttribute('data-modal'),
                );
                if (!inModalEl) {
                    const node = findNodeById(el, props.id || '');
                    inFocus.value = !!node;
                    ctx.emit('focus', node);
                }
            }
        }

        onMounted(() => {
            window.addEventListener('click', highlight);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('click', highlight);
        });

        return () => (
            <div
                id={props.id}
                data-bcms-prop-input-wrapper={'true'}
                style={props.style}
                class={
                    hasFrame.value
                        ? `${
                              inFocus.value
                                  ? 'border-green dark:border-yellow'
                                  : 'border-gray'
                          } relative flex flex-col border border-gray border-t-0 rounded-bl-2.5 rounded-br-2.5
                          p-4 mt-8 ${props.class || ''}`
                        : 'relative flex flex-col mt-4 first:mt-0'
                }
            >
                <div
                    class={
                        hasFrame.value
                            ? `group absolute flex items-center`
                            : `flex items-center border-b border-b-gray mb-4 pb-2`
                    }
                    style={
                        hasFrame.value
                            ? `top: -16px; left: -1px; width: calc(100% + 2px);`
                            : ''
                    }
                >
                    {hasFrame.value && (
                        <div
                            class={`w-2.5 h-2.5 rounded-tl-2.5 border-l border-t border-gray 
                        ${
                            inFocus.value
                                ? 'border-green dark:border-yellow'
                                : ''
                        }`}
                        ></div>
                    )}
                    <div
                        class={
                            hasFrame.value
                                ? `relative flex items-center top-[-3px] pl-2 w-full`
                                : 'flex items-center w-full'
                        }
                    >
                        <div
                            id={`${id}_label`}
                            class={`${
                                inFocus.value
                                    ? 'text-green dark:text-yellow'
                                    : ''
                            }
                            whitespace-nowrap
                            `}
                        >
                            {getLabel()}
                        </div>
                        <div
                            id={`${id}_lock`}
                            class={`ml-2 mr-2 text-darkGray dark:text-gray`}
                        >
                            {props.required ? (
                                <Icon
                                    class={`w-4 h-4 fill-current`}
                                    src={`/lock`}
                                />
                            ) : (
                                <Icon
                                    class={`w-4 h-4 fill-current`}
                                    src={`/unlock`}
                                />
                            )}
                        </div>
                        <div
                            id={`${props.id}_user_avatar_container`}
                            class={`flex items-center gap-1`}
                        />
                        {hasFrame.value && (
                            <div
                                id={`${id}_horizontal_line`}
                                class={`relative top-[-1.5px]
                            bg-gray
                            ${inFocus.value ? `bg-green dark:bg-yellow` : ''}
                            h-[1px] w-full`}
                            />
                        )}
                        {props.deletable || props.collapsable || props.array ? (
                            <div class={`flex gap-2 items-center`}>
                                {props.deletable && (
                                    <button>
                                        <Icon src={`/trash`} />
                                    </button>
                                )}
                                {props.deletable && (
                                    <button>
                                        <Icon
                                            class={`w-4 h-4 fill-current`}
                                            src={`/trash`}
                                        />
                                    </button>
                                )}
                                {props.collapsable && (
                                    <button>
                                        <Icon
                                            class={`w-4 h-4 text-dark dark:text-white fill-current`}
                                            src={`/chevron/down`}
                                        />
                                    </button>
                                )}
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                    {hasFrame.value && (
                        <div
                            class={`w-2.5 h-2.5 border-t border-r border-gray rounded-tr-2.5
                        ${
                            inFocus.value
                                ? 'border-green dark:border-yellow'
                                : ''
                        }`}
                        ></div>
                    )}
                </div>
                <div id={`${id}_border_left`}>
                    <div class={`flex flex-col gap-4`}>
                        {ctx.slots.default ? ctx.slots.default() : ''}
                    </div>
                    {props.array && (
                        <Button
                            class={`mt-4`}
                            onClick={(event) => {
                                ctx.emit('addArrayItem', event);
                            }}
                        >
                            Add new item to {getLabel()}
                        </Button>
                    )}
                </div>
            </div>
        );
    },
});

export const PropInputWrapperArrayItem = defineComponent({
    props: {
        ...DefaultComponentProps,
        label: String,
        required: Boolean,
        itemIdx: {
            type: Number,
            required: true,
        },
        initialExtended: Boolean,
        disableMoveUp: Boolean,
        disableMoveDown: Boolean,
    },
    emits: {
        delete: () => {
            return true;
        },
        move: (_direction: number) => {
            return true;
        },
        extend: (_value: boolean) => {
            return true;
        },
        focus: (_element: HTMLElement | null) => {
            return true;
        },
    },
    setup(props, ctx) {
        const inFocus = ref(false);
        const itemExtended = ref(props.initialExtended);

        function heightLight(event: Event) {
            const el = event.target as HTMLElement;
            if (el) {
                const node = findNodeById(el, props.id || '');
                inFocus.value = !!node;
                ctx.emit('focus', node);
            }
        }

        onMounted(() => {
            window.addEventListener('click', heightLight);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('click', heightLight);
        });

        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`relative border border-t-0 pt-2 pb-4 px-4 rounded-b-2.5 mt-6 mb-4 last:mb-0 
                ${
                    inFocus.value
                        ? 'border-green dark:border-yellow'
                        : 'border-gray'
                }
                ${props.class || ''}`}
                data-bcms-prop-input-wrapper-array={'true'}
            >
                <div
                    class={`absolute flex gap-2 items-center top-[-24px] left-[-6px]`}
                    style={`width: calc(100% + 14px)`}
                >
                    <button
                        class={`
                        relative flex items-center gap-4
                        ${inFocus.value ? 'text-green dark:text-yellow' : ''}
                        `}
                        onClick={() => {
                            itemExtended.value = !itemExtended.value;
                            ctx.emit('extend', itemExtended.value);
                        }}
                    >
                        <div
                            class={`
                        ${itemExtended.value ? 'rotate-90' : 'rotate-[-90deg]'}
                        `}
                        >
                            <Icon
                                class={`w-3 h-3 fill-current`}
                                src={'/chevron/right'}
                            />
                        </div>
                        <div
                            class={`whitespace-nowrap 
                        ${inFocus.value ? 'text-green dark:text-yellow' : ''}
                        `}
                        >
                            {props.label} {props.itemIdx}
                        </div>
                    </button>
                    <div
                        id={`${props.id}_user_avatar_container`}
                        class={`flex items-center gap-1`}
                    />
                    <div
                        class={`h-[1px] 
                        bg-gray
                        ${inFocus.value ? 'bg-green dark:bg-yellow' : ''}
                         w-full`}
                    />
                    <div class={`flex items-center gap-2`}>
                        <button
                            class={`text-red`}
                            onClick={() => {
                                ctx.emit('delete');
                            }}
                        >
                            <Icon
                                class={`w-4 h-4 fill-current`}
                                src={`/trash`}
                            />
                        </button>
                        <button
                            class={`text-dark disabled:text-gray dark:text-white dark:disabled:text-darkGray`}
                            disabled={props.disableMoveUp}
                            onClick={() => {
                                ctx.emit('move', -1);
                            }}
                        >
                            <Icon
                                class={`w-4 h-4 fill-current`}
                                src={`/arrow/up`}
                            />
                        </button>
                        <button
                            class={`text-dark disabled:text-gray dark:text-white dark:disabled:text-darkGray`}
                            disabled={props.disableMoveDown}
                            onClick={() => {
                                ctx.emit('move', 1);
                            }}
                        >
                            <Icon
                                class={`w-4 h-4 fill-current`}
                                src={`/arrow/down`}
                            />
                        </button>
                    </div>
                </div>
                {itemExtended.value && (
                    <div>
                        <div>
                            {ctx.slots.default ? ctx.slots.default() : ''}
                        </div>
                    </div>
                )}
            </div>
        );
    },
});
