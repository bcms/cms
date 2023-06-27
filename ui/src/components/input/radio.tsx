import { defineComponent, type PropType } from 'vue';
import type { BCMSRadioInputOption } from '../../types';
import { DefaultComponentProps } from '../_default';
import InputWrapper from './_input';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    options: Array as PropType<Array<BCMSRadioInputOption>>,
    modelValue: String,
    label: String,
    name: String,
    disabled: Boolean,
    helperText: String,
  },
  emits: {
    'update:modelValue': (val: string) => {
      return val;
    },
  },
  setup(props, { emit }) {
    function handlerInput(event: Event) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      emit('update:modelValue', element.value);
    }

    function keydownHandler(event: KeyboardEvent) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      if (event.key === 'Enter') {
        emit('update:modelValue', element.value);
      }
    }

    return () => (
      <fieldset class={props.class || ''}>
        {props.label && (
          <span class="font-normal not-italic text-xs leading-normal tracking-0.06 uppercase select-none mb-1.25 block dark:text-light">
            {props.label}
          </span>
        )}
        <div class="space-y-3.5">
          {props.options?.map((option, index) => {
            return (
              <InputWrapper helperText={props.helperText} key={index}>
                <div
                  class={`flex items-start  ${
                    props.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div
                    v-cy={props.cyTag}
                    class="flex items-center mr-2.5 transition-colors duration-300"
                  >
                    <input
                      type="radio"
                      class="sr-only"
                      name={props.name}
                      value={option.value}
                      disabled={props.disabled}
                      onChange={handlerInput}
                      onKeydown={keydownHandler}
                    />
                    <span
                      class={`relative bg-white ${
                        props.modelValue === option.value
                          ? 'border-pink dark:border-yellow'
                          : 'border-grey'
                      } border rounded-full w-5 h-5 flex justify-center items-center`}
                    >
                      {props.modelValue === option.value && (
                        <div class="w-3 h-3 bg-pink rounded-full dark:bg-yellow" />
                      )}
                    </span>
                  </div>
                  <div class="leading-tight -tracking-0.01 dark:text-light">
                    {option.label}
                  </div>
                </div>
              </InputWrapper>
            );
          })}
        </div>
      </fieldset>
    );
  },
});

export default component;
