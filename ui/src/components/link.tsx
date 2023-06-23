import { defineComponent, onMounted } from 'vue';
import { DefaultComponentProps } from './_default';
import * as uuid from 'uuid';
import { useRouter } from 'vue-router';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    selected: Boolean,
    href: {
      type: String,
      required: true,
    },
    newTab: Boolean,
    title: String,
    disabled: Boolean,
    tooltip: String,
    clickOverride: Boolean,
  },
  emits: {
    click: (_event: Event) => {
      return true;
    },
    mouseDown: (_event: MouseEvent) => {
      return true;
    },
  },
  setup(props, ctx) {
    const router = useRouter();
    const id = props.id ? props.id : uuid.v4();

    onMounted(() => {
      if (props.selected) {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView(true);
        }
      }
    });

    return () => (
      <a
        v-cy={props.cyTag}
        id={id}
        style={props.style}
        class={props.class}
        href={props.href}
        target={props.newTab ? '_blank' : undefined}
        onClick={(e) => {
          ctx.emit('click', e);
          if (!props.clickOverride) {
            if (props.disabled) {
              e.preventDefault();
              return;
            }
            if (!props.newTab && !props.href.startsWith('http')) {
              e.preventDefault();
              if (
                (event as MouseEventInit).metaKey ||
                (event as MouseEventInit).ctrlKey
              ) {
                const routeData = router.resolve({ path: props.href });
                window.open(routeData.href, '_blank');
              } else {
                router.push(props.href);
              }
            }
          }
        }}
        onMousedown={(event) => {
          ctx.emit('mouseDown', event);
        }}
        v-tooltip={props.tooltip}
      >
        {ctx.slots.default ? ctx.slots.default() : ''}
      </a>
    );
  },
});
export default component;
