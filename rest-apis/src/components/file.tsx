import { DefaultComponentProps } from '@ui/components/_default';
import { defineComponent } from 'vue';
import InputWrapper from '@ui/components/input/_input';

export const File = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: String,
    invalidText: String,
    placeholder: String,
    disabled: Boolean,
  },
  emits: {
    input: (_files: FileList | null) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <InputWrapper
        id={props.id}
        class={props.class}
        style={props.style}
        label={props.label}
      >
        <input
          type="file"
          placeholder={props.placeholder}
          disabled={props.disabled}
          onChange={(event) => {
            const el = event.target as HTMLInputElement;
            if (el) {
              ctx.emit('input', el.files);
            }
          }}
        />
      </InputWrapper>
    );
  },
});
