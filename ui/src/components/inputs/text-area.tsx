import {
    defineComponent,
    onBeforeUnmount,
    onBeforeUpdate,
    onMounted,
    type PropType,
    type ShallowRef,
} from 'vue';
import {
    type Content,
    Editor,
    EditorContent,
    type JSONContent,
    useEditor,
} from '@tiptap/vue-3';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Doc } from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import { EntryContentSyncProvider } from '@thebcms/selfhosted-ui/components/entry/content/sync-provider';

export const TextAreaInput = defineComponent({
    props: {
        ...InputProps,
        value: String,
        placeholder: String,
        disabled: Boolean,
        focus: Boolean,
        onEditor: Function as PropType<
            (editor: ShallowRef<Editor | undefined>) => void
        >,
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        input: (_value: string) => {
            return true;
        },
    },
    setup(props, ctx) {
        const throwable = window.bcms.throwable;

        const ydoc = new Doc();
        const editor = useEditor({
            content: getDocContent(props.value),
            extensions: [
                Document,
                Paragraph,
                Text,
                Placeholder.configure({
                    placeholder: props.placeholder || 'Type something',
                }),
                Collaboration.configure({
                    document: ydoc,
                }),
            ],
            editable: !props.disabled,
        });
        let yProvider: EntryContentSyncProvider | null = null;
        if (props.entrySync) {
            yProvider = new EntryContentSyncProvider(
                props.id as string,
                ydoc,
                () => editor,
                props.entrySync,
            );
        }
        /**
         * Used to skip onBeforeUpdate if update came from inside of the component
         */
        let selfUpdate = false;
        let readyForUpdates = false;

        function getDocContent(text?: string) {
            const content: Content = {
                type: 'doc',
                content: [],
            };
            if (text) {
                const paragraphs = text.split('\n');
                content.content = paragraphs.map((paragraph) => ({
                    type: 'paragraph',
                    content: paragraph
                        ? [
                              {
                                  type: 'text',
                                  text: paragraph,
                              },
                          ]
                        : [],
                }));
            } else {
                content.content = [
                    {
                        type: 'paragraph',
                        content: [],
                    },
                ];
            }
            return content;
        }

        function nodesToText(nodes: JSONContent): string {
            return (
                nodes.content
                    ?.map((content) => {
                        if (
                            content.content &&
                            content.content[0] &&
                            content.content[0].text
                        ) {
                            return content.content[0].text;
                        }
                        return '';
                    })
                    ?.join('\n') || ''
            );
        }

        onMounted(async () => {
            if (props.onEditor) {
                props.onEditor(editor);
            }
            if (editor.value) {
                editor.value.on('update', (event) => {
                    selfUpdate = true;
                    const text = nodesToText(event.editor.getJSON());
                    ctx.emit('input', text);
                });
            }
            if (yProvider) {
                await yProvider.sync(getDocContent(props.value).content as any);
            }
            readyForUpdates = true;
        });

        onBeforeUpdate(() => {
            if (readyForUpdates) {
                if (selfUpdate) {
                    selfUpdate = false;
                } else {
                    if (editor.value) {
                        const text = nodesToText(editor.value.getJSON());
                        if (props.value !== text) {
                            editor.value?.commands.setContent(
                                getDocContent(props.value),
                            );
                        }
                    }
                }
            }
        });

        onBeforeUnmount(async () => {
            if (yProvider) {
                const yp = yProvider;
                await throwable(async () => {
                    yp.destroy();
                });
            }
        });

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
                <div
                    id={props.id}
                    style={props.style}
                    class={`bcmsTextArea relative block w-full bg-white pr-6 border rounded-3.5 transition-all duration-300 shadow-none font-normal not-italic text-base leading-tight -tracking-0.01 text-dark h-11 py-0 px-4.5 outline-none placeholder-grey placeholder-opacity-100 pt-3 pb-[9px] pl-4.5 resize-none top-0 left-0 overflow-hidden hover:shadow-input focus-within:shadow-input ${
                        props.error
                            ? 'border-red hover:border-red focus-within:border-red'
                            : 'border-grey'
                    } ${
                        props.disabled
                            ? 'cursor-not-allowed opacity-40 shadow-none border-grey'
                            : 'cursor-auto'
                    } dark:bg-darkGrey dark:text-light`}
                >
                    <EditorContent editor={editor.value} />
                </div>
            </InputWrapper>
        );
    },
});
