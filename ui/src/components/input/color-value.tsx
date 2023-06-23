import { defineComponent } from 'vue';
import BCMSIcon from '../icon';
import InputWrapper from './_input';

const component = defineComponent({
  props: {
    class: String,
    value: String,
    modelValue: String,
    placeholder: String,
    label: String,
    invalidText: String,
    disabled: Boolean,
    helperText: String,
  },
  emits: {
    input: (value: string) => {
      return value;
    },
    enter: (_?: unknown) => {
      return _;
    },
    'update:modelValue': (value: string) => {
      return value;
    },
    createColor: () => {
      return true;
    },
  },
  setup(props, ctx) {
    function inputHandler(event: Event) {
      const element = event.target as HTMLInputElement;
      if (!element) return;
      ctx.emit('update:modelValue', element.value);
      ctx.emit('input', element.value);
    }

    return () => {
      return (
        <InputWrapper
          class={props.class}
          label={props.label}
          invalidText={props.invalidText}
          helperText={props.helperText}
        >
          <div
            class={`flex ${
              props.invalidText
                ? 'border border-red hover:border-red focus-within:border-red'
                : ''
            }`}
          >
            <input
              id={props.label}
              class={`relative block w-full bg-white border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
                props.invalidText
                  ? 'border-red hover:border-red focus-within:border-red pr-17.5'
                  : 'pr-[35px]'
              } ${
                props.invalidText
                  ? ''
                  : 'border-grey hover:border-grey hover:border-opacity-50 focus-within:border-grey focus-within:border-opacity-50'
              } ${
                props.disabled
                  ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                  : 'cursor-auto'
              }`}
              placeholder={props.placeholder}
              value={props.value ? props.value : props.modelValue}
              type="text"
              disabled={props.disabled}
              onChange={inputHandler}
              onKeyup={(event) => {
                inputHandler(event);
                if (event.key === 'Enter') {
                  ctx.emit('enter');
                }
              }}
            />
            <button
              class="group flex items-center"
              onClick={() => {
                ctx.emit('createColor');
              }}
            >
              <span class="font-semibold mr-2.5 transition-colors duration-200 group-hover:text-green">
                Add to list
              </span>
              <BCMSIcon
                src="/plus-circle"
                class="text-dark fill-current w-6 h-6 transition-colors duration-200 group-hover:text-green"
              />
            </button>
          </div>
        </InputWrapper>
      );
    };
  },
});
export default component;
