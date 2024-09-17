import { defineComponent, type PropType, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import type { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import {
    InputProps,
    InputWrapper,
} from '@bcms/selfhosted-ui/components/inputs/_wrapper';

const langs = {
    javascript,
};

const themes = {
    oneDark,
};

export type CodeEditorLanguage = keyof typeof langs;
export type CodeEditorTheme = keyof typeof themes;

export const CodeEditor = defineComponent({
    props: {
        ...InputProps,
        placeholder: String,
        lang: {
            type: String as PropType<CodeEditorLanguage>,
            default: 'javascript',
        },
        theme: {
            type: String as PropType<CodeEditorTheme>,
            default: 'oneDark',
        },
        value: {
            type: String,
            default: '',
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        input: (_code: string) => true,
    },
    setup(props, ctx) {
        const view = shallowRef<EditorView>();

        function handleReady(payload: { view: EditorView }) {
            view.value = payload.view;
        }

        return () => (
            <InputWrapper
                id={props.id}
                style={props.style}
                class={props.class}
                label={props.label}
                error={props.error}
                description={props.description}
                required={props.required}
            >
                <Codemirror
                    class={`font-mono ${props.class}`}
                    modelValue={props.value}
                    placeholder={props.placeholder}
                    indentWithTab={false}
                    tabSize={2}
                    extensions={[
                        langs[props.lang](),
                        themes[props.theme],
                        EditorState.readOnly.of(props.readOnly),
                    ]}
                    onReady={handleReady}
                    onChange={(value) => {
                        ctx.emit('input', value);
                    }}
                />
            </InputWrapper>
        );
    },
});
