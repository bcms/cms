import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
    Teleport,
} from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export interface DropdownItem {
    text: string | JSX.Element;
    icon?: string;
    onClick: (event: Event) => void | Promise<void>;
    border?: boolean;
    danger?: boolean;
    fixed?: boolean;
}

export const Dropdown = defineComponent({
    props: {
        ...DefaultComponentProps,
        items: {
            type: Array as PropType<DropdownItem[]>,
            required: true,
        },
        fixed: Boolean,
    },
    setup(props) {
        const maxWidth = 340;
        const maxHeight = 300;
        const showDrop = ref(false);
        const btnRef = ref<HTMLButtonElement>();
        const dropEl = ref<HTMLDivElement>();
        const mountTo = ref<{
            top?: number;
            bottom?: number;
            left?: number;
            right?: number;
        }>({});

        onMounted(() => {
            window.addEventListener('click', onClickOutside);
            window.addEventListener('resize', calcPosition);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('click', onClickOutside);
            window.removeEventListener('resize', calcPosition);
        });

        function onClickOutside(event: Event) {
            if (dropEl.value) {
                const clickedEl = event.target as HTMLElement;
                if (!clickedEl) {
                    return;
                }
                if (!dropEl.value.contains(clickedEl)) {
                    showDrop.value = false;
                }
            }
        }

        function calcPosition() {
            if (btnRef.value) {
                const bb = btnRef.value.getBoundingClientRect();
                mountTo.value = {};
                if (bb.left + maxWidth < window.innerWidth) {
                    mountTo.value.left = bb.left;
                } else {
                    mountTo.value.right = window.innerWidth - bb.right;
                }
                if (bb.bottom + maxHeight < window.innerHeight) {
                    mountTo.value.top = bb.bottom;
                    mountTo.value.top += document.body.scrollTop;
                } else {
                    mountTo.value.bottom = window.innerHeight - bb.top;
                    mountTo.value.bottom -= document.body.scrollTop;
                }
            }
        }

        return () => (
            <>
                <Button
                    id={props.id}
                    style={props.style}
                    class={props.class}
                    kind="ghost"
                    btnRef={btnRef}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        calcPosition();
                        showDrop.value = !showDrop.value;
                    }}
                >
                    <Icon
                        src={`/more-vertical`}
                        class={`w-4 h-4 fill-current`}
                    />
                </Button>
                {showDrop.value && mountTo && (
                    <Teleport to={'body'}>
                        <div
                            ref={dropEl}
                            class={`${
                                props.fixed ? 'fixed' : 'absolute'
                            } flex flex-col bg-light dark:bg-darkGray rounded-xl w-full overflow-x-hidden z-100 shadow-2xl shadow-black`}
                            style={`max-width: ${maxWidth}px; max-height: ${maxHeight}px; ${
                                mountTo.value.top
                                    ? `top: ${mountTo.value.top}px;`
                                    : `bottom: ${mountTo.value.bottom}px;`
                            } ${
                                mountTo.value.left
                                    ? `left: ${mountTo.value.left}px;`
                                    : `right: ${mountTo.value.right}px`
                            }`}
                        >
                            {props.items.map((item) => {
                                return (
                                    <button
                                        class={`px-3 py-2  ${
                                            item.border
                                                ? `border-b-[1px] border-b-gray/50 dark:border-b-white/20`
                                                : ''
                                        } ${
                                            item.danger
                                                ? 'bg-red text-white'
                                                : 'text-dark dark:text-white hover:bg-light dark:hover:bg-gray'
                                        }`}
                                        onClick={async (event) => {
                                            showDrop.value = false;
                                            if (item.onClick) {
                                                await item.onClick(event);
                                            }
                                        }}
                                    >
                                        <div class={`flex gap-4 items-center`}>
                                            {item.icon && (
                                                <div
                                                    class={`mb-auto mt-1`}
                                                >
                                                    <Icon
                                                        class={`w-4 h-4 mb-auto fill-current`}
                                                        src={item.icon}
                                                    />
                                                </div>
                                            )}
                                            <div>{item.text}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </Teleport>
                )}
            </>
        );
    },
});
