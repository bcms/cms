import { defineComponent, nextTick, onMounted, type PropType, ref } from 'vue';
import InputWrapper from './_input';

const component = defineComponent({
  inheritAttrs: true,
  props: {
    id: String,
    class: String,
    value: String,
    modelValue: String,
    placeholder: String,
    label: String,
    type: {
      type: String as PropType<'text' | 'email'>,
      default: 'text',
    },
    invalidText: String,
    disabled: Boolean,
    helperText: String,
    focusOnLoad: Boolean,
  },
  emits: {
    enter: () => {
      return true;
    },
    input: (_: string) => {
      return true;
    },
    'update:modelValue': (_: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const inputRef = ref<HTMLInputElement | null>(null);

    function inputHandler(event: Event) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      ctx.emit('update:modelValue', element.value);
      ctx.emit('input', element.value);
    }

    onMounted(() => {
      nextTick(() => {
        if (props.focusOnLoad && inputRef.value) {
          inputRef.value.focus();
        }
      });
    });

    return () => {
      return (
        <InputWrapper
          id={props.id}
          class={props.class}
          label={props.label}
          helperText={props.helperText}
          invalidText={props.invalidText}
        >
          <input
            ref={inputRef}
            type={props.type}
            id={props.id ? props.id : props.label}
            class={`relative block w-full bg-white pr-6 border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
              props.invalidText
                ? 'border-red hover:border-red focus-within:border-red'
                : 'border-grey'
            } ${
              props.disabled
                ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                : 'cursor-auto'
            } dark:bg-darkGrey dark:text-light`}
            placeholder={props.placeholder}
            value={props.value ? props.value : props.modelValue}
            disabled={props.disabled}
            onChange={inputHandler}
            onKeyup={(event) => {
              inputHandler(event);
              if (event.key === 'Enter') {
                ctx.emit('enter');
              }
            }}
          />
        </InputWrapper>
      );
    };
  },
});
export default component;
