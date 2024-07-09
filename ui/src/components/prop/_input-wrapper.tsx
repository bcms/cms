import { v4 as uuidv4 } from 'uuid';
import {
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
                    // inFocus.value = !!node;
                    const label = document.getElementById(id + '_label');
                    const lock = document.getElementById(id + '_lock');
                    const horizontalLine = document.getElementById(
                        id + '_horizontal_line',
                    );
                    const borderLeft = document.getElementById(
                        id + '_border_left',
                    );
                    if (label && lock && horizontalLine && borderLeft) {
                        if (node) {
                            label.classList.add('text-brand-700');
                            label.classList.remove('text-black');
                            lock.classList.add('stroke-brand-700');
                            lock.classList.remove('stroke-black');
                            horizontalLine.classList.add('bg-brand-700');
                            horizontalLine.classList.remove('bg-gray-300');
                            borderLeft.classList.add('border-l-brand-700');
                            borderLeft.classList.remove('border-l-gray-300');
                        } else {
                            label.classList.remove('text-brand-700');
                            label.classList.add('text-black');
                            lock.classList.remove('stroke-brand-700');
                            lock.classList.add('stroke-black');
                            horizontalLine.classList.remove('bg-brand-700');
                            horizontalLine.classList.add('bg-gray-300');
                            borderLeft.classList.remove('border-l-brand-700');
                            borderLeft.classList.add('border-l-gray-300');
                        }
                    }
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
                class={`flex flex-col pt-2 ${props.class || ''}`}
            >
                <div
                    class={`sticky flex items-center gap-2 w-full bg-gray-50 dark:bg-gray-950 z-10`}
                    style={`top: ${75 + 20 * props.propDepth}px;`}
                >
                    <div
                        id={`${id}_label`}
                        class={`${
                            inFocus.value
                                ? 'text-brand-700'
                                : `text-black dark:text-white`
                        } whitespace-nowrap`}
                    >
                        {getLabel()}
                    </div>
                    <div
                        id={`${id}_lock`}
                        class={`${
                            inFocus.value
                                ? 'stroke-brand-700'
                                : `stroke-black dark:stroke-white`
                        }`}
                    >
                        {props.required ? (
                            <Icon class={`w-4 h-4`} src={`/lock-03`} />
                        ) : (
                            <Icon class={`w-4 h-4`} src={`/lock-unlocked-03`} />
                        )}
                    </div>
                    <div
                        id={`${props.id}_user_avatar_container`}
                        class={`flex items-center gap-1`}
                    />
                    <div
                        id={`${id}_horizontal_line`}
                        class={`${
                            inFocus.value
                                ? 'bg-brand-700'
                                : 'bg-gray-300 dark:bg-gray-700'
                        } h-[1px] w-full`}
                    />
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
                                        class={`stroke-error`}
                                        src={`/trash`}
                                    />
                                </button>
                            )}
                            {props.collapsable && (
                                <button>
                                    <Icon
                                        class={`stroke-black`}
                                        src={`/minimize-01`}
                                    />
                                </button>
                            )}
                            {props.array && (
                                <Button
                                    class={`whitespace-nowrap`}
                                    kind={`ghost`}
                                    onClick={(event) => {
                                        ctx.emit('addArrayItem', event);
                                    }}
                                >
                                    Add new item to {getLabel()}
                                </Button>
                            )}
                        </div>
                    ) : (
                        ''
                    )}
                </div>
                <div
                    id={`${id}_border_left`}
                    class={`ml-2.5 mt-2 border-l ${
                        inFocus.value
                            ? 'border-l-brand-700'
                            : 'border-l-gray-300 dark:border-gray-700'
                    } pl-2`}
                >
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
                class={`pl-3 ${props.class || ''}`}
                data-bcms-prop-input-wrapper-array={'true'}
            >
                <div class={`sticky flex gap-2 items-center`}>
                    <button
                        class={`${
                            inFocus.value
                                ? 'stroke-brand-700'
                                : `stroke-black dark:stroke-white`
                        } ${
                            itemExtended.value ? 'rotate-90' : 'rotate-[-90deg]'
                        }`}
                        onClick={() => {
                            itemExtended.value = !itemExtended.value;
                            ctx.emit('extend', itemExtended.value);
                        }}
                    >
                        <Icon src={'/chevron-left'} />
                    </button>
                    <div
                        class={`whitespace-nowrap ${
                            inFocus.value
                                ? 'text-brand-700'
                                : 'text-black dark:text-white'
                        }`}
                    >
                        {props.label} {props.itemIdx}
                    </div>
                    <div
                        id={`${props.id}_user_avatar_container`}
                        class={`flex items-center gap-1`}
                    />
                    <div
                        class={`h-[1px] ${
                            inFocus.value
                                ? 'bg-brand-700'
                                : 'bg-gray-300 dark:bg-gray-700'
                        } w-full`}
                    />
                    <div class={`flex items-center gap-2`}>
                        <button
                            class={`stroke-error`}
                            onClick={() => {
                                ctx.emit('delete');
                            }}
                        >
                            <Icon src={`/trash-01`} />
                        </button>
                        <button
                            class={`stroke-black disabled:stroke-gray-400`}
                            disabled={props.disableMoveUp}
                            onClick={() => {
                                ctx.emit('move', -1);
                            }}
                        >
                            <Icon src={`/arrow-up`} />
                        </button>
                        <button
                            class={`stroke-black disabled:stroke-gray-400`}
                            disabled={props.disableMoveDown}
                            onClick={() => {
                                ctx.emit('move', 1);
                            }}
                        >
                            <Icon src={`/arrow-down`} />
                        </button>
                    </div>
                </div>
                {itemExtended.value && (
                    <div
                        class={`border-l mt-2 ${
                            inFocus.value
                                ? 'border-l-brand-900'
                                : `border-l-gray-300 dark:border-l-gray-700`
                        }`}
                    >
                        <div class={`ml-3`}>
                            {ctx.slots.default ? ctx.slots.default() : ''}
                        </div>
                    </div>
                )}
            </div>
        );
    },
});
