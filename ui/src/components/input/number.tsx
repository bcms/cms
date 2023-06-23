import { defineComponent } from 'vue';
import InputWrapper from './_input';

const component = defineComponent({
  inheritAttrs: true,
  props: {
    class: String,
    value: Number,
    modelValue: Number,
    placeholder: String,
    label: String,
    invalidText: String,
    disabled: Boolean,
    helperText: String,
    propPath: String,
  },
  emits: {
    enter: () => {
      return true;
    },
    input: (_: number) => {
      return true;
    },
    'update:modelValue': (_: number) => {
      return true;
    },
  },
  setup(props, ctx) {
    function inputHandler(event: Event) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      let val = element.value.replace(/[^0-9.-.]+/g, '');
      const dotParts = val.split('.');
      if (dotParts.length > 2) {
        val = dotParts.slice(0, 2).join('.');
      }
      element.value = val;
      const output = parseFloat(val);
      if (isNaN(output)) {
        ctx.emit('update:modelValue', 0);
        ctx.emit('input', 0);
      } else {
        ctx.emit('update:modelValue', output);
        ctx.emit('input', output);
      }
    }

    return () => {
      return (
        <InputWrapper
          class={props.class}
          label={props.label}
          helperText={props.helperText}
          invalidText={props.invalidText}
        >
          <input
            id={props.label}
            data-bcms-prop-path={props.propPath}
            class={`relative block w-full bg-white pr-6 border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
              props.invalidText
                ? 'border-red hover:border-red focus-within:border-red'
                : ''
            } ${
              props.invalidText
                ? ''
                : 'border-grey hover:border-grey hover:border-opacity-50 focus-within:border-grey focus-within:border-opacity-50'
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
