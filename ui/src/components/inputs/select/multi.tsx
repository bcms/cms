import { defineComponent, type PropType } from 'vue';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import {
    Select,
    type SelectOption,
} from '@thebcms/selfhosted-ui/components/inputs/select/main';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export const MultiSelect = defineComponent({
    props: {
        ...InputProps,
        options: {
            type: Array as PropType<SelectOption[]>,
            required: true,
        },
        selected: {
            type: Array as PropType<string[]>,
            default: () => {
                return [];
            },
        },
        placeholder: String,
        disabled: Boolean,
        searchable: Boolean,
        showSearch: {
            type: Boolean,
            default: false,
        },
        unremovable: { type: Array as PropType<string[]>, default: () => [] },
        propPath: String,
    },
    emits: {
        input: (
            _value: string[],
            _metadata: {
                add?: string;
                remove?: string;
            },
        ) => {
            return true;
        },
    },
    setup(props, ctx) {
        return () => (
            <InputWrapper {...props}>
                <div
                    class={`p-2 bg-white dark:bg-darkGray border border-gray dark:border-gray rounded-2.5 flex gap-2 flex-wrap`}
                >
                    {/*<div class={'flex gap-2'}>*/}
                        {props.selected.map((item) => {
                            const option = props.options.find(
                                (e) => e.value === item,
                            );
                            if (!option) {
                                return <></>;
                            }
                            return (
                                <div
                                    class={`flex gap-2 text-s bg-green dark:bg-yellow text-black items-center rounded py-1 px-2`}
                                >
                                    <div class={`font-medium`}>
                                        {option.label}
                                    </div>
                                    {!props.unremovable.includes(
                                        option.value,
                                    ) && (
                                        <button
                                            class={`p-2`}
                                            onClick={() => {
                                                ctx.emit(
                                                    'input',
                                                    props.selected.filter(
                                                        (e) => e !== item,
                                                    ),
                                                    {
                                                        remove: item,
                                                    },
                                                );
                                            }}
                                        >
                                            <Icon
                                                class={`w-5 h-5 fill-current text-white hover:text-red`}
                                                src={'/close'}
                                            />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    {/*</div>*/}
                    <Select
                        searchable={props.searchable}
                        disabled={props.disabled}
                        placeholder={props.placeholder}
                        options={props.options.filter(
                            (e) => !props.selected.includes(e.value),
                        )}
                        onChange={(option) => {
                            if (option) {
                                ctx.emit(
                                    'input',
                                    [...props.selected, option.value],
                                    {
                                        add: option.value,
                                    },
                                );
                            }
                        }}
                    />
                </div>
            </InputWrapper>
        );
    },
});
