import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
    ref,
} from 'vue';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@thebcms/selfhosted-ui/util/sub';

export const NumberInput = defineComponent({
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
            _triggerByEntrySync?: boolean,
        ) => {
            return true;
        },
        enter: (_event: Event) => {
            return true;
        },
    },
    setup(props, ctx) {
        const inputRef = ref<HTMLInputElement | null>(null);
        const unsubs: UnsubscribeFns = [];

        function handleInput(event: Event) {
            const element = event.target as HTMLInputElement;
            if (!element) {
                return;
            }
            let val = element.value.replace(/[^0-9---.]+/g, '');
            const dotParts = val.split('.');
            if (dotParts.length > 2) {
                val = dotParts.slice(0, 2).join('.');
            }
            if (val.includes('-')) {
                val = '-' + val.replace(/-/g, '');
            }
            element.value = val;
            const output = parseFloat(val);
            if (!isNaN(output)) {
                ctx.emit('input', output, event);
            }
        }

        onMounted(() => {
            if (props.focus) {
                inputRef.value?.focus();
            }
            if (props.entrySync && props.id) {
                unsubs.push(
                    props.entrySync.onNumberUpdate(props.id, async (data) => {
                        if (typeof data.value === 'number') {
                            ctx.emit('input', data.value, undefined, true);
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
                <input
                    ref={inputRef}
                    type={props.type}
                    id={
                        props.id
                            ? props.id
                            : typeof props.label === 'string'
                            ? props.label
                            : ''
                    }
                    class={`relative block w-full bg-white pr-6 border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
                        props.error
                            ? 'border-red hover:border-red focus-within:border-red'
                            : 'border-grey'
                    } ${
                        props.disabled
                            ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                            : 'cursor-auto'
                    } dark:bg-darkGrey dark:text-light`}
                    placeholder={props.placeholder}
                    value={props.value}
                    disabled={props.disabled}
                    onInput={handleInput}
                    onChange={handleInput}
                    onKeyup={(event) => {
                        if (event.key === 'Enter') {
                            ctx.emit('enter', event);
                        }
                    }}
                />
            </InputWrapper>
        );
    },
});
