import { defineComponent } from 'vue';
import { BCMSIcon } from '../../index';

const component = defineComponent({
  props: {
    item: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    remove: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <li class="max-w-full flex items-center py-1 pr-0 pl-3 rounded-3.5 relative overflow-hidden">
        <span class="relative top-px whitespace-nowrap overflow-hidden text-base overflow-ellipsis text-white z-20 dark:text-dark">
          {props.item}
        </span>
        <button
          class="group peer py-0 pr-2 pl-2.5 flex items-center justify-center z-30 relative focus:outline-none"
          disabled={props.disabled}
          aria-label={`Remove ${props.item}`}
          onClick={() => {
            ctx.emit('remove');
          }}
        >
          <div class="flex text-white text-opacity-70 group-hover:text-dark group-hover:text-opacity-100 group-focus:text-dark group-focus:text-opacity-100">
            <BCMSIcon
              src="/close"
              class="fill-current w-6 m-auto transition-all duration-200 flex-shrink-0 dark:text-dark"
            />
          </div>
        </button>
        <div class="absolute top-0 left-0 w-full h-full block bg-green z-10 transition-colors duration-300 peer-hover:bg-red peer-focus:bg-red dark:bg-yellow dark:text-dark" />
      </li>
    );
  },
});
export default component;
