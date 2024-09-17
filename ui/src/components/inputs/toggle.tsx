import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
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

export const Toggle = defineComponent({
    props: {
        ...InputProps,
        value: Boolean,
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        input: (
            _value: boolean,
            _event?: Event,
            _triggeredByEntrySync?: boolean,
        ) => {
            return true;
        },
    },
    setup(props, ctx) {
        const unsubs: UnsubscribeFns = [];

        onMounted(() => {
            if (props.entrySync && props.id) {
                unsubs.push(
                    props.entrySync.onBoolUpdate(props.id, async (data) => {
                        if (typeof data.value !== 'undefined') {
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
            <InputWrapper {...props}>
                <button
                    class={`flex flex-col gap-2`}
                    onClick={(event) => {
                        ctx.emit('input', !props.value, event);
                    }}
                >
                    <div>
                        <div
                            class={`relative flex rounded-full h-5 p-[2px] ${
                                props.value
                                    ? ' bg-green dark:bg-yellow'
                                    : 'bg-gray'
                            } w-9 transition-all duration-300 overflow-hidden`}
                        >
                            <div
                                class={`absolute duration-300 transition-all w-4 h-4 bg-white dark:bg-darkGray shadow-lg rounded-full top-0.5 ${
                                    props.value ? 'right-0.5' : 'left-0.5'
                                }`}
                            />
                        </div>
                    </div>
                </button>
            </InputWrapper>
        );
    },
});
