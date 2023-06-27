import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../_default';
import InputWrapper from './_input';
import Icon from '../icon';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    value: Boolean,
    modelValue: Boolean,
    placeholder: String,
    label: String,
    invalidText: String,
    disabled: Boolean,
    helperText: String,
    description: String,
  },
  emits: {
    enter: () => {
      return true;
    },
    input: (_: boolean) => {
      return true;
    },
    'update:modelValue': (_: boolean) => {
      return true;
    },
  },
  setup(props, { emit }) {
    function handlerInput(event: Event) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      emit('input', element.checked);
    }

    function keydownHandler(event: KeyboardEvent) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      if (event.key === 'Enter') {
        emit('input', !element.checked);
      }
    }

    return () => (
      <InputWrapper
        class={`max-w-max ${props.class}`}
        label={props.label}
        helperText={props.helperText}
        invalidText={props.invalidText}
      >
        <div
          v-cy={props.cyTag}
          class={`flex items-center transition-colors duration-300 ${
            props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <input
            id={props.label}
            type="checkbox"
            class="sr-only"
            checked={props.value}
            disabled={props.disabled}
            onChange={handlerInput}
            onKeydown={keydownHandler}
          />
          <span
            class={`relative ${
              props.value
                ? 'bg-pink border-pink dark:bg-yellow dark:border-yellow'
                : 'bg-white border-grey'
            } border rounded w-5 h-5 flex justify-center items-center`}
          >
            {props.value && (
              <Icon
                src="/checkmark"
                class="w-3.5 h-3.5 m-auto text-white fill-current relative -top-px dark:text-dark"
              />
            )}
          </span>
          {props.description && (
            <span class="relative top-0.5 pl-2.5 dark:text-light select-none">
              {props.description}
            </span>
          )}
        </div>
      </InputWrapper>
    );
  },
});

export default component;
