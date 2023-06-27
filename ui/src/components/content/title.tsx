import { defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';
import InputWrapper from '../input/_input';

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
    const textBoxRef = ref<HTMLElement | null>(null);

    const inputHandler = (event: Event) => {
      const element = event.target as HTMLElement;

      ctx.emit('update:modelValue', element.innerText);
      ctx.emit('input', element.innerText);
    };

    onMounted(() => {
      if (props.value && textBoxRef.value) {
        textBoxRef.value.innerText = props.value;
      }
    });
    onBeforeUpdate(() => {
      if (textBoxRef.value) {
        if (textBoxRef.value.innerText !== props.value) {
          textBoxRef.value.innerText = props.value;
        }
      }
    });

    return () => {
      return (
        <InputWrapper class={props.class} label={props.label}>
          <div class="relative">
            {!props.value && (
              <span class="absolute block pl-1 leading-tight text-12.5 text-grey pointer-events-none max-w-full truncate overflow-hidden">
                {props.placeholder}
              </span>
            )}
            <span
              data-bcms-prop-path="m0.data.0"
              ref={textBoxRef}
              role="textbox"
              contenteditable
              class="block w-full overflow-hidden leading-tight text-12.5 cursor-text focus:outline-none dark:text-light break-all min-h-15"
              onPaste={(event) => {
                event.preventDefault();
                const text = event.clipboardData?.getData('text/plain');
                document.execCommand('insertHTML', false, text);
              }}
              onKeyup={(event) => {
                inputHandler(event);
              }}
              onInput={inputHandler}
            ></span>
          </div>
        </InputWrapper>
      );
    };
  },
});

export default component;
