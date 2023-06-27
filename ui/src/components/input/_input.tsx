import { defineComponent, type PropType, type Ref } from 'vue';

const component = defineComponent({
  props: {
    id: String,
    class: String,
    invalidTextClass: String,
    helperTextClass: String,
    labelClass: String,
    label: String,
    invalidText: String,
    helperText: String,
    additionalHelperSlot: Object as PropType<JSX.Element | string | undefined>,
    containerRef: Object as PropType<Ref<HTMLElement | null>>,
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => {
      return (
        <label
          // for={props.label}
          class={`flex flex-col ${props.class}`}
          onClick={() => {
            ctx.emit('click');
          }}
          for={props.id ? props.id : props.label}
          ref={props.containerRef}
        >
          {props.label && (
            <span class="flex items-center space-x-3 mb-1.5 justify-between">
              <span
                class={`font-normal not-italic text-xs leading-normal tracking-0.06 select-none uppercase block ${
                  props.labelClass || ''
                } ${
                  props.invalidText
                    ? 'text-red dark:text-red'
                    : 'dark:text-light'
                }`}
              >
                {props.label}
              </span>
              {props.additionalHelperSlot && (
                <span>{props.additionalHelperSlot}</span>
              )}
            </span>
          )}
          <span class="relative w-full">
            {ctx.slots.default ? ctx.slots.default() : ''}
            {props.helperText && (
              <span
                class={`mt-2.5 text-sm leading-normal pointer-events-none text-grey ${
                  props.helperTextClass || ''
                }`}
                v-html={props.helperText}
              />
            )}
          </span>
          {props.invalidText && (
            <span
              class={`flex font-normal not-italic text-xs leading-normal tracking-0.06 select-none text-red dark:text-red mt-1.5 ${
                props.invalidTextClass || ''
              }`}
            >
              {props.invalidText}
            </span>
          )}
        </label>
      );
    };
  },
});
export default component;
