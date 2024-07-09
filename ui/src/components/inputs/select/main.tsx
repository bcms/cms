import { v4 as uuidv4 } from 'uuid';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
    Teleport,
} from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@thebcms/selfhosted-ui/util/sub';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export interface SelectOption {
    label: string;
    value: string;
    slot?(): JSX.Element;
    class?: string;
}

export const Select = defineComponent({
    props: {
        ...InputProps,
        placeholder: String,
        disabled: Boolean,
        selected: {
            type: String,
            default: '',
        },
        options: {
            type: Array as PropType<SelectOption[]>,
            required: true,
        },
        searchable: Boolean,
        entrySync: Object as PropType<EntrySync>,
        fixed: Boolean,
    },
    emits: {
        change: (_option?: SelectOption, _triggeredByEntrySync?: boolean) => {
            return true;
        },
    },
    setup(props, ctx) {
        const opened = ref(false);
        const searchTerm = ref('');
        const selectedOption = computed(() =>
            props.options.find((e) => e.value === props.selected),
        );
        const filteredOptions = computed(() => {
            if (props.searchable) {
                return props.options.filter(
                    (option) =>
                        option.label.toLowerCase().includes(searchTerm.value) ||
                        option.value.toLowerCase().includes(searchTerm.value),
                );
            }
            return props.options;
        });
        const inputRef = ref<HTMLButtonElement>();
        const dropdownId = uuidv4();
        const dropdownPosition = ref({
            top: 0,
            left: 0,
            width: '100px',
            visible: false,
        });
        const highlightOptionIdx = ref(-1);
        const unsubs: UnsubscribeFns = [];

        function onKeyDown(event: KeyboardEvent) {
            if (opened.value) {
                const charCode = event.key.toLowerCase().charCodeAt(0);
                if (
                    props.searchable &&
                    event.key.length === 1 &&
                    ((charCode >= 48 && charCode <= 57) ||
                        (charCode >= 97 && charCode <= 122))
                ) {
                    searchTerm.value += event.key[0].toLowerCase();
                    highlightOptionIdx.value = -1;
                } else {
                    switch (event.key) {
                        case 'Backspace':
                            {
                                if (searchTerm.value.length > 0) {
                                    searchTerm.value = searchTerm.value.slice(
                                        0,
                                        searchTerm.value.length - 1,
                                    );
                                    highlightOptionIdx.value = -1;
                                }
                            }
                            break;
                        case 'ArrowUp':
                            {
                                highlightOptionIdx.value--;
                                if (highlightOptionIdx.value < 0) {
                                    highlightOptionIdx.value =
                                        filteredOptions.value.length - 1;
                                }
                            }
                            break;
                        case 'ArrowDown':
                            {
                                highlightOptionIdx.value++;
                                if (
                                    highlightOptionIdx.value >
                                    filteredOptions.value.length - 1
                                ) {
                                    highlightOptionIdx.value = 0;
                                }
                            }
                            break;
                        case 'Escape':
                            {
                                opened.value = false;
                            }
                            break;
                        case 'Enter':
                            {
                                selectOption();
                            }
                            break;
                    }
                    const el = document.getElementById(
                        `select_item_${highlightOptionIdx.value}`,
                    );
                    if (el) {
                        el.scrollIntoView();
                    }
                }
            }
        }

        function calcDropdownPosition() {
            if (inputRef.value) {
                const inputEl = inputRef.value;
                const bBox = inputEl.getBoundingClientRect();
                dropdownPosition.value.top =
                    bBox.y + document.body.scrollTop + bBox.height;
                dropdownPosition.value.left = bBox.x;
                setTimeout(() => {
                    const dropdownEl = document.getElementById(dropdownId);
                    if (dropdownEl) {
                        if (
                            bBox.y + dropdownEl.offsetHeight + bBox.height >
                            window.innerHeight
                        ) {
                            dropdownPosition.value.top =
                                bBox.y +
                                document.body.scrollTop -
                                dropdownEl.offsetHeight;
                        }
                    }
                    dropdownPosition.value.visible = true;
                }, 20);
            }
        }

        function selectOption() {
            if (highlightOptionIdx.value !== -1) {
                const option = filteredOptions.value[highlightOptionIdx.value];
                if (option) {
                    ctx.emit('change', option);
                }
            }
        }

        onMounted(() => {
            window.addEventListener('keydown', onKeyDown);
            if (props.entrySync && props.id) {
                unsubs.push(
                    props.entrySync.onEnumUpdate(props.id, async (data) => {
                        if (typeof data.value !== 'undefined') {
                            const option = props.options.find(
                                (e) => e.value === data.value,
                            );
                            ctx.emit('change', option, true);
                        }
                    }),
                );
            }
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(unsubs);
            window.removeEventListener('keydown', onKeyDown);
        });

        function listOption(option: SelectOption, optionIdx: number) {
            return (
                <li id={`select_item_${optionIdx}`}>
                    <button
                        class={`text-left ${
                            highlightOptionIdx.value === optionIdx
                                ? 'bg-gray text-dark dark:text-white'
                                : option.value === props.selected
                                ? 'bg-yellow'
                                : 'bg-white dark:bg-darkGray text-black dark:text-white'
                        } w-full px-4 py-2`}
                        onClick={() => {
                            selectOption();
                            opened.value = false;
                        }}
                        onMouseenter={() => {
                            highlightOptionIdx.value = optionIdx;
                        }}
                    >
                        {option.slot ? option.slot() : option.label}
                    </button>
                </li>
            );
        }

        return () => (
            <InputWrapper
                id={props.id}
                style={props.style}
                class={props.class}
                error={props.error}
                label={props.label}
                description={props.description}
                required={props.required}
            >
                <div id={props.id}>
                    <button
                        ref={inputRef}
                        class={`flex gap-2 items-center bg-white dark:bg-darkGray border border-gray rounded-2.5 px-3 py-2`}
                        onClick={() => {
                            calcDropdownPosition();
                            opened.value = !opened.value;
                            dropdownPosition.value.visible = false;
                            if (opened.value) {
                                highlightOptionIdx.value =
                                    filteredOptions.value.findIndex(
                                        (e) => e.value === props.selected,
                                    );
                                window.addEventListener('keydown', onKeyDown);
                            } else {
                                window.removeEventListener(
                                    'keydown',
                                    onKeyDown,
                                );
                            }
                        }}
                    >
                        {props.searchable && (
                            <div class={`stroke-gray-400 dark:stroke-gray-200`}>
                                <Icon class={`w-3 h-3`} src={`/search`} />
                            </div>
                        )}
                        <div>
                            {searchTerm.value
                                ? searchTerm.value
                                : selectedOption.value
                                ? selectedOption.value.slot
                                    ? selectedOption.value.slot()
                                    : selectedOption.value.label
                                : props.placeholder}
                        </div>
                        <div
                            class={`stroke-gray-400 ${
                                opened.value ? `rotate-90` : `rotate-[-90deg]`
                            }`}
                        >
                            <Icon
                                class={`w-3 h-3 text-dark dark:text-white fill-current`}
                                src={'/chevron/right'}
                            />
                        </div>
                    </button>
                    {opened.value && (
                        <Teleport to={`body`}>
                            <ul
                                id={dropdownId}
                                class={`${props.fixed ? 'fixed' : 'absolute'} ${
                                    dropdownPosition.value.visible
                                        ? ''
                                        : 'opacity-0'
                                } z-1000 max-h-[300px] text-dark dark:text-white overflow-auto bg-white dark:bg-darkGray rounded-2.5 shadow-input max-w-[320px]`}
                                style={{
                                    top: `${dropdownPosition.value.top}px`,
                                    left: `${dropdownPosition.value.left}px`,
                                    // width: `${dropdownPosition.value.width}`,
                                }}
                                v-clickOutside={() => {
                                    opened.value = false;
                                    dropdownPosition.value.visible = false;
                                }}
                            >
                                {filteredOptions.value.length > 0 ? (
                                    filteredOptions.value.map(
                                        (option, optionIdx) =>
                                            listOption(option, optionIdx),
                                    )
                                ) : (
                                    <div class={`px-8 py-6`}>No options</div>
                                )}
                            </ul>
                        </Teleport>
                    )}
                </div>
            </InputWrapper>
        );
    },
});
