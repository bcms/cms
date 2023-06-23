import {
  defineComponent,
  onBeforeUpdate,
  onMounted,
  type PropType,
  ref,
} from 'vue';
import InputWrapper from './_input';

const component = defineComponent({
  props: {
    class: {
      type: String,
      default: '',
    },
    modelValue: String,
    value: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    invalidText: {
      type: String,
      default: '',
    },
    helperText: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    minHeight: {
      type: Number,
      default: 44,
    },
    propPath: String,
    format: Function as PropType<(value: string) => string>,
  },
  emits: {
    input: (_: string) => {
      return true;
    },
    'update:modelValue': (_?: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const height = ref(props.minHeight);
    const textareaRef = ref<HTMLTextAreaElement | null>(null);
    const initialValue = props.value
      ? props.value
      : props.modelValue
      ? props.modelValue
      : '';

    const logic = {
      inputHandler(event: Event) {
        const element = event.target as HTMLTextAreaElement;
        if (!element) {
          return;
        }
        if (props.format) {
          element.value = props.format(element.value);
        }
        ctx.emit('update:modelValue', element.value);
        ctx.emit('input', element.value);
      },
      handleHeight(event: Event) {
        const element = event.target as HTMLInputElement;
        if (!element) {
          return;
        }
        if (element.value.length > 40 || element.value.includes('\n')) {
          height.value = 22.5 * 13 + 12;
        } else {
          height.value = 44;
        }
      },
      findDraggableParent(el: HTMLElement): HTMLElement | null {
        if (el.id === 'widget_wrapper') {
          return el;
        }
        const parent = el.parentNode as HTMLElement;
        if (parent) {
          return logic.findDraggableParent(parent);
        }
        return null;
      },
    };

    onMounted(() => {
      if (textareaRef.value) {
        textareaRef.value.value = initialValue;
      }
      logic.handleHeight({ target: textareaRef.value } as never);
    });

    onBeforeUpdate(() => {
      if (textareaRef.value) {
        if (props.value !== textareaRef.value.value) {
          textareaRef.value.value = props.value;
          logic.handleHeight({ target: textareaRef.value } as never);
        }
      }
    });

    return () => {
      return (
        <InputWrapper
          class={props.class}
          label={props.label}
          invalidText={props.invalidText}
          helperText={props.helperText}
        >
          <textarea
            data-bcms-prop-path={props.propPath}
            ref={textareaRef}
            class={`bcmsScrollbar relative block w-full bg-white pr-6 border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 hover:shadow-input focus-within:shadow-input ${
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
            onChange={(event) => {
              logic.inputHandler(event);
            }}
            onKeyup={logic.inputHandler}
            onInput={logic.handleHeight}
            onFocus={(event) => {
              const el = logic.findDraggableParent(
                event.currentTarget as HTMLElement,
              );
              if (el) {
                el.setAttribute('draggable', 'false');
              }
            }}
            onBlur={(event) => {
              const el = logic.findDraggableParent(
                event.currentTarget as HTMLElement,
              );
              if (el) {
                el.setAttribute('draggable', 'true');
              }
            }}
            placeholder={props.placeholder}
            disabled={props.disabled}
            style={{ height: `${height.value}px !important` }}
          />
        </InputWrapper>
      );
    };
  },
});
export default component;
