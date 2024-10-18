import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
} from 'vue';
import {
    InputProps,
    InputWrapper,
} from '@bcms/selfhosted-ui/components/inputs/_wrapper';
import type { EntrySync } from '@bcms/selfhosted-ui/services/entry-sync';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@bcms/selfhosted-ui/util/sub';
import { Icon } from '@bcms/selfhosted-ui/components/icon';

export const DateInput = defineComponent({
    props: {
        ...InputProps,
        value: Number,
        focus: Boolean,
        type: String,
        disabled: Boolean,
        placeholder: String,
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        input: (
            _value: number,
            _event?: Event,
            _triggeredByEntrySync?: boolean,
        ) => {
            return true;
        },
        enter: (_event: Event) => {
            return true;
        },
    },
    setup(props, ctx) {
        const inputRef = ref<HTMLInputElement | null>(null);
        const dateAsString = computed(() => {
            return props.value && props.value !== -1 ? toDate(props.value) : '';
            // : toDate(Date.now());
        });
        const unsubs: UnsubscribeFns = [];

        function toDate(millis: number): string {
            const date = new Date(millis);
            return `${date.getFullYear()}-${
                date.getMonth() + 1 < 10
                    ? '0' + (date.getMonth() + 1)
                    : date.getMonth() + 1
            }-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
        }

        function handleInput(event: Event) {
            const element = event.target as HTMLInputElement;
            const value = !element.valueAsNumber ? -1 : element.valueAsNumber;
            ctx.emit('input', value, event);
            if ((event as KeyboardEvent).key === 'Enter') {
                ctx.emit('enter', event);
            }
        }

        onMounted(() => {
            if (props.focus) {
                inputRef.value?.focus();
            }
            if (props.entrySync && props.id) {
                unsubs.push(
                    props.entrySync.onDateUpdate(props.id, async (data) => {
                        if (typeof data.value !== 'undefined') {
                            ctx.emit(
                                'input',
                                data.value.timestamp,
                                undefined,
                                true,
                            );
                        }
                    }),
                );
            }
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(unsubs);
        });

        return () => (
            <InputWrapper
                id={props.id}
                style={props.style}
                class={props.class}
                label={props.label}
                error={props.error}
                description={props.description}
                required={props.required}
            >
                <div class={`flex items-center gap-3`}>
                    <input
                        ref={inputRef}
                        type="date"
                        id={
                            props.id
                                ? props.id
                                : typeof props.label === 'string'
                                ? props.label
                                : ''
                        }
                        class={`relative block w-full bg-white dark:bg-gray-800 pr-6 border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-black dark:text-white h-11 py-0 px-4.5 outline-none placeholder-grey-500 dark:placeholder-gray-400 placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
                            props.error
                                ? 'border-red hover:border-red focus-within:border-red'
                                : 'border-grey-500 dark:border-gray-700'
                        } ${
                            props.disabled
                                ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                                : 'cursor-auto'
                        } dark:bg-darkGrey dark:text-light`}
                        placeholder={props.placeholder}
                        value={dateAsString.value}
                        disabled={props.disabled}
                        onInput={handleInput}
                        onChange={handleInput}
                        onKeyup={(event) => {
                            if (event.key === 'Enter') {
                                ctx.emit('enter', event);
                            }
                        }}
                    />
                    <button
                        aria-label="Reset date"
                        title="Reset date"
                        class="relative group flex z-10 ml-auto"
                        disabled={props.disabled}
                        onClick={(event) => {
                            ctx.emit('input', -1, event);
                        }}
                    >
                        <Icon
                            src="/close"
                            class="pb-[5px] stroke-black dark:stroke-white text-opacity-50 fill-current w-6 h-6 m-auto transition-all duration-200 group-hover:text-error group-hover:text-opacity-100 group-focus:text-error group-focus:text-opacity-100 dark:text-white"
                        />
                    </button>
                </div>
            </InputWrapper>
        );
    },
});
