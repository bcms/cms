import { defineComponent } from 'vue';

export const NoneLayout = defineComponent({
    setup(_, ctx) {
        return () => (ctx.slots.default ? ctx.slots.default() : <div></div>);
    },
});
