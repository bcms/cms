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
          (window as any).bcmsRestApisLinkClick(event, `#${props.href}`);
          // event.preventDefault();
          // event.stopPropagation();
          // window.history.replaceState(
          //   null,
          //   '',
          //   window.location.pathname + `#${props.href}`
          // );
          // const el = document.getElementById(props.href);
          // if (el) {
          //   const bb = el.getBoundingClientRect();
          //   if (
          //     bb.top > window.scrollX + window.innerHeight ||
          //     bb.bottom < window.scrollX
          //   ) {
          //     el.scrollIntoView();
          //     el.classList.add('bg-green');
          //     setTimeout(() => {
          //       el.classList.remove('bg-green');
          //     }, 1000);
          //   }
          // }
          ctx.emit('click', event);
        }}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
