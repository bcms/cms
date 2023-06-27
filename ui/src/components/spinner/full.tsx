import { computed, defineComponent, Transition } from 'vue';
import { useTranslation } from '../../translations';
import BCMSIcon from '../icon';
import { DefaultComponentProps } from '../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    show: Boolean,
    message: String,
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });

    return () => {
      if (props.show) {
        return (
          <Transition name="fade" mode="out-in" appear={true}>
            <div
              class={`fixed top-0 left-0 w-full h-full bg-dark bg-opacity-40 flex flex-col z-1000 ${props.class}`}
            >
              <div class="mt-auto mx-auto mb-12">
                <BCMSIcon
                  src="/cog"
                  class="text-light fill-current w-16 h-16 animate-spin"
                  style="animation-duration: 4s !important;"
                />
              </div>
              <div class="text-light text-3xl font-light text-center mb-auto">
                {props.message
                  ? props.message
                  : translations.value.layout.spinner.wait}
              </div>
              {ctx.slots.default ? (
                <div class="m-auto max-w-screen-sm overflow-x-hidden overflow-y-auto flex flex-col">
                  {ctx.slots.default()}
                </div>
              ) : (
                ''
              )}
            </div>
          </Transition>
        );
      }
      return <div class="hidden" />;
    };
  },
});
export default component;
