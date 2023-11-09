import { DefaultComponentProps } from '@ui/components/_default';
import { defineComponent } from 'vue';
import InputWrapper from '@ui/components/input/_input';

export const DocVisualSchema = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: String,
    schema: {
      type: String,
      required: true,
    },
  },
  emits: {
    dblClick: () => {
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
        <div class="visualSchema--wrapper">
          <pre
            class="visualSchema"
            v-html={props.schema}
            onDblclick={() => {
              ctx.emit('dblClick');
            }}
          />
        </div>
      </InputWrapper>
    );
  },
});
