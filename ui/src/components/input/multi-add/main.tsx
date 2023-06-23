import {
  defineComponent,
  onBeforeUpdate,
  onMounted,
  type PropType,
  ref,
} from 'vue';
import InputWrapper from '../_input';
import BCMSMultiAddItem from './item';
import { DefaultComponentProps } from '../../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    value: {
      type: Array as PropType<string[]>,
      required: true,
    },
    placeholder: String,
    label: String,
    invalidText: String,
    helperText: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    format: Function as PropType<(value: string) => string>,
    validate: Function as PropType<(value: string[]) => string | null>,
    focusOnLoad: Boolean,
  },
  emits: {
    input: (_value: string[]) => {
      return true;
    },
  },
  setup(props, ctx) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const itemsBuffer = ref(props.value);
    const items = ref(props.value);
    const invalidText = ref(props.invalidText);

    onBeforeUpdate(async () => {
      let update = false;
      if (itemsBuffer.value.length !== props.value.length) {
        update = true;
      } else {
        for (let i = 0; i < props.value.length; i++) {
          if (itemsBuffer.value[i] !== props.value[i]) {
            update = true;
            break;
          }
        }
      }
      if (update) {
        itemsBuffer.value = props.value;
        items.value = props.value;
      }
    });

    onMounted(() => {
      setTimeout(() => {
        if (props.focusOnLoad && inputRef.value) {
          inputRef.value.focus();
        }
      }, 0);
    });

    function handleInput(event: Event | KeyboardEvent) {
      const element = event.target as HTMLInputElement;
      if (!element) {
        return;
      }
      if ((event as KeyboardEvent).key === 'Enter' && element.value) {
        if (typeof props.validate === 'function') {
          const error = props.validate([...items.value, element.value]);
          if (error) {
            invalidText.value = error;
            return;
          }
        }
        items.value = [...items.value, element.value];
        element.value = '';
        ctx.emit('input', items.value);
      } else {
        if (typeof props.format === 'function') {
          element.value = props.format(element.value);
        }
      }
    }

    return () => (
      <InputWrapper
        class={props.class}
        label={props.label}
        invalidText={props.invalidText ? props.invalidText : invalidText.value}
        helperText={props.helperText}
      >
        <input
          ref={inputRef}
          class={`relative block w-full bg-white border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
            props.invalidText || invalidText.value
              ? 'border-red hover:border-red focus-within:border-red'
              : 'pr-6 border-grey'
          } ${
            props.disabled
              ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
              : 'cursor-auto'
          } dark:bg-darkGrey dark:text-light`}
          id={props.label}
          placeholder={props.placeholder}
          disabled={props.disabled}
          onChange={handleInput}
          onKeyup={handleInput}
        />
        {items.value.length > 0 && (
          <div class="pt-2.5">
            <ul class="list-none flex flex-wrap gap-[5px]">
              {items.value.map((item) => (
                <BCMSMultiAddItem
                  item={item}
                  disabled={props.disabled}
                  onRemove={() => {
                    items.value = items.value.filter((e) => e !== item);
                    ctx.emit('input', items.value);
                  }}
                />
              ))}
            </ul>
          </div>
        )}
      </InputWrapper>
    );
  },
});
export default component;
