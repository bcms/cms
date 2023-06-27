import { defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';
import { DefaultComponentProps } from './_default';
import { createQueue } from '@banez/queue';

const cache: {
  [src: string]: string;
} = {};
const queue = createQueue();

function styleInjection(input: string, cls?: string, style?: string): string {
  let output = '' + input;
  if (cls) {
    output = output.replace('<svg', `<svg class="${cls}"`);
  }
  if (style) {
    output = output.replace('<svg', `<svg style="${style}"`);
  }
  return output;
}

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    src: String,
  },
  setup(props) {
    let srcBuffer = '';
    const container = ref<HTMLElement | undefined>();

    function init() {
      const path = props.src as string;
      if (path) {
        queue({
          name: 'bcms-icon',
          async handler() {
            if (cache[path]) {
              const el = container.value;
              if (el) {
                el.innerHTML = '';
                el.innerHTML = styleInjection(
                  cache[path],
                  props.class,
                  props.style
                );
              }
            } else {
              const response = await fetch(
                `${window.bcms.origin}/assets/icons${path}.svg`
              );
              const value = await response.text();
              const src = styleInjection(value, props.class, props.style);
              const el = container.value;
              if (el) {
                el.innerHTML = '';
                el.innerHTML = styleInjection(src, props.class, props.style);
              }
              cache[path] = src;
            }
          },
        }).wait.catch((error) => {
          console.error(error);
        });
      }
    }
    onMounted(() => {
      srcBuffer = props.src + '';
      init();
    });

    onBeforeUpdate(() => {
      if (srcBuffer !== props.src) {
        srcBuffer = props.src + '';
        init();
      }
    });

    return () => {
      return (
        <div
          ref={container}
          class="bcmsIcon flex pointer-events-none"
          data-src={props.src}
          v-cy={props.cyTag}
        />
      );
    };
  },
});
export default component;
