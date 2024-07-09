import { defineComponent, type PropType, ref } from 'vue';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export const MultiAdd = defineComponent({
    props: {
        ...InputProps,
        value: {
            type: Array as PropType<string[]>,
            default: () => {
                return [];
            },
        },
        format: Function as PropType<(value: string, event: Event) => string>,
        placeholder: String,
    },
    emits: {
        input: (
            _value: string[],
            _info: { add?: string; remove?: string },
            _event: Event,
        ) => {
            return true;
        },
    },
    setup(props, ctx) {
        const inputValue = ref('');

        return () => (
            <InputWrapper {...props}>
                <div
                    class={`p-2 bg-white dark:bg-darkGray border border-gray dark:border-gray rounded-2.5 flex gap-2 flex-wrap`}
                >
                    {props.value.map((value) => {
                        return (
                            <div
                                class={`flex gap-2 items-center text-sm text-dark bg-green dark:bg-yellow rounded py-1 px-2`}
                            >
                                <div class={`font-medium`}>{value}</div>
                                <button
                                    onClick={(event) => {
                                        ctx.emit(
                                            'input',
                                            props.value.filter(
                                                (e) => e !== value,
                                            ),
                                            { remove: value },
                                            event,
                                        );
                                    }}
                                >
                                    <Icon
                                        class={`w-5 h-5 fill-current text-dark hover:text-red`}
                                        src={'/close'}
                                    />
                                </button>
                            </div>
                        );
                    })}
                    <input
                        class={`w-full bg-white dark:bg-darkGray rounded py-1 px-2 focus:outline-none`}
                        placeholder={props.placeholder || `Type something`}
                        value={inputValue.value}
                        onInput={(event) => {
                            const el = event.target as HTMLInputElement;
                            if (props.format) {
                                el.value = props.format(el.value, event);
                            }
                            inputValue.value = el.value;
                        }}
                        onKeyup={(event) => {
                            if (event.key === 'Enter') {
                                ctx.emit(
                                    'input',
                                    [
                                        ...props.value.filter(
                                            (e) => e !== inputValue.value,
                                        ),
                                        inputValue.value,
                                    ],
                                    { add: inputValue.value },
                                    event,
                                );
                                inputValue.value = '';
                            }
                        }}
                    />
                </div>
            </InputWrapper>
        );
    },
});
