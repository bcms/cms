import { defineComponent } from 'vue';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';

export const CheckBox = defineComponent({
    props: {
        ...InputProps,
        value: Boolean,
        text: {
            type: String,
            required: true,
        },
    },
    emits: {
        input: (_value: boolean, _event?: Event) => {
            return true;
        },
    },
    setup(props, ctx) {
        return () => (
            <InputWrapper
                id={props.id}
                label={props.label}
                error={props.error}
                description={props.description}
            >
                <button
                    class={`flex flex-col gap-2 ${props.class}`}
                    onClick={(event) => {
                        ctx.emit('input', !props.value, event);
                    }}
                >
                    <div class={`flex gap-3 items-center`}>
                        <div
                            class={`relative flex rounded-full w-4 h-4 p-[2px] overflow-hidden border border-gray`}
                        >
                            <div
                                class={`duration-300 transition-all w-full h-full rounded-full ${
                                    props.value ? `bg-green dark:bg-yellow` : ''
                                }`}
                            />
                        </div>
                        <div class={`text-left`}>{props.text}</div>
                    </div>
                </button>
            </InputWrapper>
        );
    },
});
