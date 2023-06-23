import { defineComponent, type PropType } from 'vue';
import BCMSIcon from '../icon';
import { DefaultComponentProps } from '../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    text: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    theme: {
      type: String as PropType<'default' | 'danger'>,
      required: false,
      default: 'default',
    },
    icon: String,
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => {
      return (
        <div
          id={props.id}
          class={`flex ${props.class ? props.class : ''}`}
          style={props.style}
          v-cy={props.cyTag}
        >
          <button
            onClick={() => {
              ctx.emit('click');
            }}
            class="group w-full flex flex-col transition-colors duration-300 py-4 px-5.5 text-left hover:bg-light focus-visible:bg-light hover:text-green focus-visible:text-green dark:text-light dark:hover:bg-grey dark:focus-visible:bg-grey dark:hover:text-yellow dark:focus-visible:text-yellow"
          >
            <div class="flex items-center">
              {props.icon && (
                <BCMSIcon
                  src={
                    props.icon.startsWith('/') ? props.icon : `/${props.icon}`
                  }
                  class={`mr-3.5 w-6 h-6 ${
                    props.theme === 'default'
                      ? 'text-grey group-hover:text-green group-focus-visible:text-green dark:group-hover:text-yellow dark:group-focus-visible:text-yellow'
                      : 'text-red'
                  } fill-current transition-colors duration-300`}
                />
              )}
              <span class={`${props.theme === 'default' ? '' : 'text-red'}`}>
                {props.text}
              </span>
            </div>
            {props.description && (
              <p class="text-dark text-sm -tracking-0.01 leading-[1.43] mt-2 dark:text-light">
                {props.description}
              </p>
            )}
          </button>
        </div>
      );
    };
  },
});
export default component;
