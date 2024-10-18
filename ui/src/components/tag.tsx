import { defineComponent } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';

export const Tag = defineComponent({
    props: {
        ...DefaultComponentProps,
        danger: Boolean,
    },
    setup(props, ctx) {
        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`flex gap-2 ${
                    props.danger ? 'bg-red' : 'bg-green'
                } px-2 py-1 rounded text-white dark:text-black text-xs font-medium ${
                    props.class || ''
                }`}
            >
                {ctx.slots.default ? ctx.slots.default() : ''}
            </div>
        );
    },
});
