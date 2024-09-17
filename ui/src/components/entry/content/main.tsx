import { v4 as uuidv4 } from 'uuid';
import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onBeforeUpdate,
    onMounted,
    type PropType,
    type ShallowRef,
} from 'vue';
import { type Content, Editor, EditorContent, useEditor } from '@tiptap/vue-3';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Document } from '@tiptap/extension-document';
import { Text } from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Heading } from '@tiptap/extension-heading';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Link } from '@tiptap/extension-link';
import { BulletList } from '@tiptap/extension-bullet-list';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { CodeBlock } from '@tiptap/extension-code-block';
import { HardBreak } from '@tiptap/extension-hard-break';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Doc } from 'yjs';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import type { EntryContentNode } from '@bcms/selfhosted-backend/entry/models/content';
import type { EntrySync } from '@bcms/selfhosted-ui/services/entry-sync';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import { linkSplitChar } from '@bcms/selfhosted-ui/components/modals/entry/content/link-edit';
import { mediaGetPreviewUrl } from '@bcms/selfhosted-ui/util/media';
import { EntryContentSyncProvider } from '@bcms/selfhosted-ui/components/entry/content/sync-provider';
import { createSlashCommandExtension } from '@bcms/selfhosted-ui/components/entry/content/extensions/slash-command';
import { EntryContentNodeWidgetNodeConfig } from '@bcms/selfhosted-ui/components/entry/content/nodes/widget';
import { InlineCodeMark } from '@bcms/selfhosted-ui/components/entry/content/marks/inline-code';
import { EntryContentEditorToolbar } from '@bcms/selfhosted-ui/components/entry/content/toolbar';

const w = window as any;

interface LinkPopupData {
    url?: string;
    mediaId?: string;
    entry?: {
        eid: string;
        tid: string;
    };
    bottom: number;
    left: number;
}

export const EntryContentEditor = defineComponent({
    props: {
        ...DefaultComponentProps,
        entryId: {
            type: String,
            required: true,
        },
        propPath: {
            type: String,
            required: true,
        },
        nodes: {
            type: Array as PropType<EntryContentNode[]>,
            required: true,
        },
        allowedWidgets: Array as PropType<string[]>,
        placeholder: String,
        disabled: Boolean,
        lngIdx: {
            type: Number,
            required: true,
        },
        onEditorMounted: Function as PropType<
            (editor: ShallowRef<Editor | undefined>) => void
        >,
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        input: (_nodes: EntryContentNode[]) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const [language] = window.bcms.useLanguage();

        const me = computed(() => sdk.store.user.methods.me() as UserProtected);
        const middlewareId = 'm_' + uuidv4().replace(/-/g, '');
        const linkMiddleware = {
            onClick(event: MouseEvent) {
                const el = event.target as HTMLLinkElement;
                if (el && el.href) {
                    modal.handlers.entryContentLinkEdit.open({
                        data: {
                            href: el.href,
                        },
                        onDone(data) {
                            if (data.href) {
                                editor.value
                                    ?.chain()
                                    .focus()
                                    .extendMarkRange('link')
                                    .setLink({ href: data.href })
                                    .run();
                            } else {
                                editor.value
                                    ?.chain()
                                    .focus()
                                    .extendMarkRange('link')
                                    .unsetLink()
                                    .run();
                            }
                        },
                    });
                }
            },
            async onMouseEnter(event: MouseEvent) {
                const el = event.target as HTMLLinkElement;
                if (el) {
                    const linkPopupEl = document.getElementById(
                        middlewareId + '_link_popup',
                    );
                    if (linkPopupEl) {
                        let linkPopupData: LinkPopupData | null = null;
                        const bBox = el.getBoundingClientRect();
                        const bottom = window.innerHeight - bBox.y;
                        const left = bBox.x;
                        const href = el.href;
                        if (
                            href.startsWith('entry:') &&
                            href.endsWith(':entry')
                        ) {
                            const [eid, tid] = href
                                .replace(/entry:/g, '')
                                .replace(/:entry/g, '')
                                .split(linkSplitChar);
                            linkPopupData = {
                                bottom,
                                left,
                                entry: {
                                    eid,
                                    tid,
                                },
                            };
                            const entry = linkPopupData.entry
                                ? sdk.store.entryLite.findById(
                                      linkPopupData.entry.eid,
                                  )
                                : undefined;
                            const entryInfo =
                                entry?.info.find(
                                    (e) => e.lng === language.value,
                                ) || entry?.info[0];
                            const entryMedia = entryInfo?.media
                                ? sdk.store.media.findById(entryInfo.media)
                                : undefined;
                            linkPopupEl.innerHTML = `
              <div class="flex gap-3 items-center">
                ${
                    entryMedia
                        ? `
                    <div class="flex-shrink-0 w-8 h-8">
                      <img
                        class="w-full h-full object-cover"
                        src="${await mediaGetPreviewUrl(entryMedia, {
                            thumbnail: true,
                        })}" alt="${entryMedia.altText}"
                      />
                    </div>
                    `
                        : ''
                }
                <div class="flex flex-col gap-2 text-sm">
                  <div class="font-medium">${entryInfo?.title}</div>
                  <div class="flex flex-col gap-2 text-xs font-sec">${
                      entryInfo?.description
                          ? entryInfo.description.length > 120
                              ? (entryInfo.description.slice(0, 120) + ' ...')
                                    .split('\n')
                                    .map((line) => {
                                        return `<div>${line}</div>`;
                                    })
                              : entryInfo.description
                                    .split('\n')
                                    .map((line) => {
                                        return `<div>${line}</div>`;
                                    })
                          : ''
                  }</div>
                </div>
              </div>
              `;
                        } else if (
                            href.startsWith('media:') &&
                            href.endsWith(':media')
                        ) {
                            const [mediaId] = href
                                .replace(/media:/g, '')
                                .replace(/:media/g, '')
                                .split(linkSplitChar);
                            linkPopupData = {
                                bottom,
                                left,
                                mediaId,
                            };
                            const media = mediaId
                                ? sdk.store.media.findById(mediaId)
                                : undefined;
                            if (media) {
                                linkPopupEl.innerHTML = `
                <div class="w-10 h-10">
                  <img
                    class="w-full h-full object-cover"
                    src="${await mediaGetPreviewUrl(media, {
                        thumbnail: true,
                    })}" alt="${media.altText}"
                  />
                </div>
                `;
                            } else {
                                linkPopupEl.innerHTML = `
                <div class="text-error">Missing media file</div>
                `;
                            }
                        } else {
                            linkPopupData = {
                                bottom,
                                left,
                                url: href,
                            };
                            linkPopupEl.innerHTML = `
              <div class="text-xs">${linkPopupData.url}</div>
              `;
                        }
                        linkPopupEl.classList.remove('hidden');
                        linkPopupEl.setAttribute(
                            'style',
                            `bottom: ${linkPopupData.bottom}px; left: ${linkPopupData.left}px;`,
                        );
                    }
                }
            },
            onMouseLeave() {
                const linkPopupEl = document.getElementById(
                    middlewareId + '_link_popup',
                );
                if (linkPopupEl) {
                    linkPopupEl.classList.add('hidden');
                }
            },
        };
        w[middlewareId] = {
            linkMiddleware,
        };

        const ydoc = new Doc();
        let yProvider: EntryContentSyncProvider | null = null;
        if (props.entrySync) {
            yProvider = new EntryContentSyncProvider(
                props.propPath,
                ydoc,
                () => editor,
                props.entrySync,
            );
        }
        const editor = useEditor({
            content: getDocContent([]),
            extensions: [
                createSlashCommandExtension({
                    sdk,
                    basePath: props.propPath,
                    allowedWidgets: props.allowedWidgets,
                }),
                EntryContentNodeWidgetNodeConfig.configure({
                    HTMLAttributes: {
                        entryId: props.entryId,
                    },
                }),
                Document,
                Paragraph.configure({
                    HTMLAttributes: {
                        class: `paragraph relative text-base -tracking-0.01 leading-tight dark:text-white`,
                        icon: '/type-01',
                    },
                }),
                Text,
                Placeholder.configure({
                    placeholder: props.placeholder || 'Type something',
                }),
                Heading.configure({
                    HTMLAttributes: {
                        class: `heading mb-12 relative font-normal leading-none md:mb-10 dark:text-white`,
                    },
                }),
                Bold.configure({
                    HTMLAttributes: {
                        class: 'font-bold',
                    },
                }),
                Italic.configure({
                    HTMLAttributes: {
                        class: 'italic',
                    },
                }),
                Underline.configure({
                    HTMLAttributes: {
                        class: 'underline',
                    },
                }),
                Strike.configure({
                    HTMLAttributes: {
                        class: 'line-through',
                    },
                }),
                HorizontalRule.configure({
                    HTMLAttributes: {
                        class: 'horizontalLine',
                    },
                }),
                HardBreak.configure({
                    HTMLAttributes: {
                        class: 'break',
                    },
                }),
                InlineCodeMark.configure({
                    HTMLAttributes: {
                        class: 'inlineCode',
                    },
                }),
                CodeBlock.configure({
                    HTMLAttributes: {
                        class: `code mb-12 relative bg-gray-100 text-black p-4 font-medium text-xs rounded-2.5 md:mb-10 dark:text-white dark:bg-gray-900 dark:border dark:border-gray-800`,
                        icon: '/code-square-02',
                    },
                }),
                Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                        onclick: `${middlewareId}.linkMiddleware.onClick(event)`,
                        onmouseenter: `${middlewareId}.linkMiddleware.onMouseEnter(event)`,
                        onmouseleave: `${middlewareId}.linkMiddleware.onMouseLeave(event)`,
                        class: 'text-brand-700 cursor-pointer relative',
                    },
                }),
                ListItem.extend({
                    addAttributes() {
                        return {
                            list: {
                                default: true,
                            },
                        };
                    },
                }).configure({
                    HTMLAttributes: {
                        class: 'listItem relative mb-3 pl-5 last:mb-0',
                    },
                }),
                BulletList.configure({
                    HTMLAttributes: {
                        class: 'unorderedList relative mb-12 list-none md:mb-10',
                        icon: '/dotpoints-01',
                    },
                }),
                OrderedList.configure({
                    HTMLAttributes: {
                        class: 'orderedList relative mb-12 list-none md:mb-10',
                        icon: '/dotpoints-02',
                    },
                }),
                Dropcursor.configure({
                    color: '#ff00ff',
                }),
                Collaboration.configure({
                    document: ydoc,
                    field: props.propPath,
                }),
                CollaborationCursor.configure({
                    provider: yProvider,
                    user: {
                        name: me.value.username,
                        color: '#f783ac',
                    },
                }),
            ],
            editable: !props.disabled,
        });
        /**
         * Used to skip onBeforeUpdate if update came from inside of the component
         */
        let selfUpdate = false;
        let readyForUpdates = false;

        function getDocContent(nodes: EntryContentNode[]) {
            const content: Content = {
                type: 'doc',
                content:
                    nodes.length > 0
                        ? nodes
                        : [
                              {
                                  type: 'paragraph',
                                  content: [],
                              },
                          ],
            };
            return content;
        }

        function findDraggableParent(el: HTMLElement): HTMLElement | null {
            if (el.id === 'widget_wrapper') {
                return el;
            }
            const parent = el.parentNode as HTMLElement;
            if (parent) {
                return findDraggableParent(parent);
            }
            return null;
        }

        onMounted(async () => {
            if (props.onEditorMounted) {
                props.onEditorMounted(editor);
            }
            if (editor.value) {
                editor.value.on('update', (event) => {
                    const json = event.editor.getJSON();
                    if (json.content) {
                        selfUpdate = true;
                        for (let i = 0; i < json.content.length; i++) {
                            const node = json.content[i];
                            if (node.type === 'widget') {
                                (
                                    node.attrs as any
                                ).propPath = `entry.content.${props.lngIdx}.nodes.${i}.attrs.data`;
                            }
                        }
                        ctx.emit('input', json.content as EntryContentNode[]);
                    }
                });
                editor.value.on('focus', (event) => {
                    const el = findDraggableParent(
                        event.event.currentTarget as HTMLElement,
                    );
                    if (el) {
                        el.setAttribute('draggable', 'false');
                    }
                });
                editor.value.on('blur', (event) => {
                    const el = findDraggableParent(
                        event.event.currentTarget as HTMLElement,
                    );
                    if (el) {
                        el.setAttribute('draggable', 'true');
                    }
                });
            }
            throwable(async () => {
                await sdk.entry.getAllLite();
                await sdk.media.getAll();
            }).catch((err) => console.error(err));
            if (yProvider) {
                await yProvider.sync(
                    (getDocContent(props.nodes)
                        .content as EntryContentNode[]) || [],
                );
            }
            readyForUpdates = true;
        });

        onBeforeUpdate(() => {
            if (readyForUpdates) {
                if (selfUpdate) {
                    selfUpdate = false;
                } else {
                    editor.value?.commands.setContent(
                        getDocContent(props.nodes),
                    );
                }
            }
        });

        onBeforeUnmount(async () => {
            w[middlewareId] = undefined;
            if (editor.value) {
                editor.value.destroy();
            }
            if (yProvider) {
                const yp = yProvider;
                await throwable(async () => {
                    yp.destroy();
                });
            }
        });

        return () => (
            <div
                id={props.propPath}
                style={props.style}
                class={`bcmsEntryContentEditor ${props.class || ''}`}
            >
                {editor.value && (
                    <EntryContentEditorToolbar
                        propPath={props.propPath}
                        editor={editor.value}
                        allowedWidgets={props.allowedWidgets}
                    />
                )}
                <EditorContent
                    class={`bcmsEntryContentEditor--content`}
                    editor={editor.value}
                />
                <div
                    id={middlewareId + '_link_popup'}
                    class={`hidden fixed z-10 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2.5 px-3 py-1 max-w-[300px]`}
                />
            </div>
        );
    },
});
