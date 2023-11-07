import { defineComponent } from 'vue';

export const Link = defineComponent({
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  emits: {
    click: (_event: MouseEvent) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <a
        href={window.location.pathname + '#' + props.href}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          window.history.pushState(
            null,
            '',
            window.location.pathname + `#${props.href}`
          );
          ctx.emit('click', event);
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
