import { computed, defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '../_default';
import InputWrapper from './_input';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: String,
    modelValue: Boolean,
    value: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    states: Object as PropType<[string, string]>,
    helperText: String,
    propPath: String,
  },
  emits: {
    input: (_value: boolean) => {
      return true;
    },
    'update:modelValue': (_?: boolean) => {
      return true;
    },
  },
  setup(props, ctx) {
    // const state = ref(getState());
    const state = computed(() =>
      props.value ? props.value : props.modelValue ? props.modelValue : false
    );
    function keyDownHandler(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        ctx.emit('input', !state.value);
        ctx.emit('update:modelValue', !state.value);
      }
    }

    return () => (
      <InputWrapper
        class={`${props.class} w-max`}
        label={props.label}
        helperText={props.helperText}
        onClick={() => {
          if (!props.disabled) {
            ctx.emit('input', !state.value);
            ctx.emit('update:modelValue', !state.value);
          }
        }}
      >
        <div
          data-bcms-prop-path={props.propPath}
          id={props.label}
          class="group flex items-center outline-none"
          tabindex="0"
          onKeydown={keyDownHandler}
        >
          <span
            class={`inline-block relative h-5 w-9 rounded-2xl border ${
              state.value
                ? 'border-pink bg-pink dark:border-yellow dark:bg-yellow'
                : 'border-grey bg-white dark:bg-darkGrey'
            } ${
              props.disabled
                ? 'cursor-not-allowed opacity-30'
                : 'cursor-pointer'
            }`}
          >
            <span
              class={`absolute w-3.5 h-3.5 rounded-full top-1/2 left-[3px] -translate-y-1/2 ${
                state.value
                  ? 'bg-white left-[unset] right-[3px]'
                  : 'bg-grey left-[3px]'
              } ${props.disabled ? 'right-[3px] left-[unset]' : ''}`}
            />
          </span>
          {props.states ? (
            <span
              class={`relative top-0.5 pl-2.5 text-base select-none transition-colors duration-200 ${
                props.disabled
                  ? 'cursor-not-allowed text-grey'
                  : 'cursor-pointer dark:text-light'
              }`}
            >
              {state.value ? props.states[0] : props.states[1]}
            </span>
          ) : (
            ''
          )}
        </div>
      </InputWrapper>
    );
  },
});
export default component;
