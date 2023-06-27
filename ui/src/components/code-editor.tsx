import { defineComponent, type PropType, shallowRef } from 'vue';
import { DefaultComponentProps } from './_default';
import { Codemirror } from 'vue-codemirror';
import type { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    mode: {
      type: String as PropType<'javascript'>,
      default: 'javascript',
    },
    code: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    change: (_code: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const view = shallowRef<EditorView>();
    function handleReady(payload: { view: EditorView }) {
      view.value = payload.view;
    }

    return () => {
      return (
        <Codemirror
          class={`bcmsCodeEditor ${props.class}`}
          modelValue={props.code}
          placeholder="Type here ..."
          indentWithTab={false}
          tabSize={2}
          extensions={[
            javascript(),
            oneDark,
            EditorState.readOnly.of(props.readOnly),
          ]}
          onReady={handleReady}
          onChange={(value) => {
            ctx.emit('change', value);
          }}
        />
      );
    };
  },
});
export default component;
