/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid';
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  type PropType,
} from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import ListItem from '@tiptap/extension-list-item';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Toolbar from './toolbar';
import Paragraph from '@tiptap/extension-paragraph';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Heading from '@tiptap/extension-heading';
import CodeBlock from '@tiptap/extension-code-block';
import Dropcursor from '@tiptap/extension-dropcursor';
// import Collaboration from '@tiptap/extension-collaboration';
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import BCMSWidget from './widget';
import type { Editor, Extensions } from '@tiptap/core';
import type { BCMSEntryExtendedContent, BCMSEntrySync } from '../../types';
import { createBcmsSlashCommand } from './slash-command';
import { useTranslation } from '../../translations';
import * as Y from 'yjs';
import {
  BCMSMediaType,
  BCMSSocketSyncChangeType,
  type BCMSSocketSyncChangeDataProp,
  type BCMSUser,
} from '@becomes/cms-sdk/types';
import { BCMSInlineCodeMark } from './marks';
import { BCMSContentProvider } from './provider';
import { BCMSEntrySyncService } from '../../services';
import Collaboration from '@tiptap/extension-collaboration';

const component = defineComponent({
  props: {
    id: { type: String, default: '' },
    content: {
      type: Object as PropType<BCMSEntryExtendedContent>,
      required: true,
    },
    lng: { type: String, default: 'en' },
    lngIndex: { type: Number, default: 0 },
    allowedWidgetIds: Array as PropType<string[]>,
    inMeta: { type: Boolean, default: false },
    invalidText: { type: String, default: '' },
    propPath: String,
    entrySync: Object as PropType<BCMSEntrySync>,
    showCollaborationCursor: Boolean,
    user: Object as PropType<BCMSUser>,
    disallowWidgets: Boolean,
  },
  emits: {
    editorReady: (_editor: Editor, _ydoc: Y.Doc) => {
      return true;
    },
    updateContent: (_propPath: string, _update: number[]) => {
      return true;
    },
  },
  setup(props, ctx) {
    const ydoc = new Y.Doc();
    const rootClass = 'bcmsContentEditor';
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const middlewareId = `m${uuidv4().replace(/-/g, '')}`;
    const translations = computed(() => {
      return useTranslation();
    });
    const yProvider = new BCMSContentProvider(
      props.propPath + '',
      ydoc,
      props.entrySync as BCMSEntrySync,
    );
    const editor = getEditor();
    yProvider.editor = editor;
    let lngBuffer = '';
    let idBuffer = '';
    let nodesBuffer = '{}';
    let entryIdBuffer = BCMSEntrySyncService.entry?.value?._id || '';
    let entrySyncUnsub: () => void;
    let linkHoverEl: HTMLElement | null = null;

    window.bcms.editorLinkMiddleware[middlewareId] = (event) => {
      const el = event.currentTarget as HTMLLinkElement;
      const href = el.getAttribute('href') as string;
      if (linkHoverEl) {
        document.body.removeChild(linkHoverEl);
      }
      window.bcms.modal.content.link.show({
        href,
        onDone(data) {
          if (data.href) {
            (editor.value as Editor)
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href: data.href })
              .run();
          } else {
            (editor.value as Editor)
              .chain()
              .focus()
              .extendMarkRange('link')
              .unsetLink()
              .run();
          }
        },
      });
    };
    window.bcms.editorLinkMiddleware[middlewareId + '_me'] = async (event) => {
      const el = event.target as HTMLLinkElement;
      const href = el.getAttribute('href') as string;
      const bb = el.getBoundingClientRect();
      linkHoverEl = document.createElement('div');
      let isError = false;
      if (href.startsWith('media:')) {
        const [id] = href.replace('media:', '').split('@*_');
        if (id) {
          isError = await window.bcms.util.throwable(
            async () => {
              const media = await window.bcms.sdk.media.getById(id);
              if (media) {
                let src = '';
                if (
                  media.type === BCMSMediaType.VID ||
                  media.type === BCMSMediaType.GIF
                ) {
                  src = `${window.bcms.origin}/api/media/${
                    media._id
                  }/vid/bin/thumbnail?act=${window.bcms.sdk.storage.get('at')}`;
                } else {
                  src = `${window.bcms.origin}/api/media/${
                    media._id
                  }/bin/small/act?act=${window.bcms.sdk.storage.get('at')}`;
                }
                if (linkHoverEl) {
                  if (
                    media.type === BCMSMediaType.IMG ||
                    media.type === BCMSMediaType.VID ||
                    media.type === BCMSMediaType.GIF
                  ) {
                    linkHoverEl.innerHTML = `<div class="rounded-sm overflow-hidden w-36 h-36"><img src="${src}" /></div>`;
                  } else {
                    linkHoverEl.innerHTML = `<span class="text-white px-[10px]">file: ${media.name}</span>`;
                  }
                }
              }
            },
            async () => {
              return false;
            },
            async () => {
              (
                linkHoverEl as HTMLElement
              ).innerHTML = `<span class="px-[10px]">${translations.value.page.entry.editor.mediaDoesNotExist}</span>`;
              return true;
            },
          );
        }
      } else if (href.startsWith('entry:')) {
        isError = await window.bcms.util.throwable(
          async () => {
            if (linkHoverEl) {
              const [eid, tid] = href.replace('entry:', '').split('@*_');
              const entry = await window.bcms.sdk.entry.getLite({
                templateId: tid,
                entryId: eid,
              });
              let meta = entry.meta.find((e) => e.lng === props.lng);
              if (!meta) {
                meta = entry.meta[0];
              }
              linkHoverEl.innerHTML = `<span class="px-[10px]">${
                (meta.props[0].data as string[])[0]
              }</span>`;
            }
          },
          async () => {
            return false;
          },
          async () => {
            (
              linkHoverEl as HTMLElement
            ).innerHTML = `<span class="px-[10px]">${translations.value.page.entry.editor.entryDoesNotExist}</span>`;
            return true;
          },
        );
      } else {
        linkHoverEl.innerHTML = `<span class="text-white px-[10px]">${href}</span>`;
      }
      if (isError) {
        el.classList.add('text-red');
        el.classList.remove('dark:text-yellow', 'text-green');
      }
      linkHoverEl.setAttribute(
        'class',
        `text-white rounded-sm py-[2px] px-[2px] desktop:text-xs opacity-50 dark:opacity-100 whitespace-nowrap block absolute ${
          isError ? 'bg-red' : 'bg-dark dark:bg-grey'
        }`,
      );
      linkHoverEl.setAttribute('style', 'opacity: 0;');
      setTimeout(() => {
        if (linkHoverEl) {
          linkHoverEl.setAttribute(
            'style',
            `opacity: 1; top: ${
              bb.y - 10 + document.body.scrollTop - linkHoverEl.offsetHeight
            }px; left: ${bb.x - linkHoverEl.offsetWidth / 4}px`,
          );
        }
      }, 20);
      document.body.appendChild(linkHoverEl);
    };
    window.bcms.editorLinkMiddleware[middlewareId + '_ml'] = () => {
      if (linkHoverEl) {
        try {
          document.body.removeChild(linkHoverEl);
          linkHoverEl = null;
        } catch (error) {
          // do nothing
        }
      }
    };

    function getEditor() {
      const extensions: Extensions = [
        Document,
        History,
        createBcmsSlashCommand({ allowedWidgets: props.allowedWidgetIds }),
        Dropcursor,
        Paragraph.configure({
          HTMLAttributes: {
            class:
              'paragraph relative text-base -tracking-0.01 leading-tight dark:text-light',
            icon: '/editor/text',
          },
        }),
        Text.configure({
          HTMLAttributes: {
            class: 'text',
          },
        }),
        BulletList.configure({
          HTMLAttributes: {
            class: 'unorderedList relative mb-12 list-none md:mb-10',
            icon: '/editor/list-ul',
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
        CodeBlock.configure({
          HTMLAttributes: {
            class:
              'code mb-12 relative bg-dark bg-opacity-5 text-dark p-4 font-medium text-xs rounded-2.5 md:mb-10 dark:bg-opacity-20 dark:text-light dark:bg-darkGrey dark:bg-opacity-50 dark:border dark:border-grey dark:border-opacity-20',
            icon: '/editor/code',
          },
        }),
        HardBreak.configure({
          HTMLAttributes: {
            class: 'break',
          },
        }),
        Heading.configure({
          HTMLAttributes: {
            class:
              'heading mb-12 relative font-normal leading-none md:mb-10 dark:text-light',
          },
        }),
        HorizontalRule.configure({
          HTMLAttributes: {
            class: 'horizontalLine',
          },
        }),
        OrderedList.configure({
          HTMLAttributes: {
            class: 'orderedList relative mb-12 list-none md:mb-10',
            icon: '/editor/list-ol',
          },
        }),
        Bold.configure({
          HTMLAttributes: {
            class: 'font-bold',
          },
        }),
        BCMSInlineCodeMark.configure({
          HTMLAttributes: {
            class: 'inlineCode',
          },
        }),
        Italic.configure({
          HTMLAttributes: {
            class: 'italic',
          },
        }),
        Strike.configure({
          HTMLAttributes: {
            class: 'line-through',
          },
        }),
        Link.configure({
          openOnClick: false,
          validate(url) {
            console.log(url);
            return true;
          },
          HTMLAttributes: {
            onclick: `bcms.editorLinkMiddleware.${middlewareId}(event)`,
            onmouseenter: `bcms.editorLinkMiddleware.${
              middlewareId + '_me'
            }(event)`,
            onmouseleave: `bcms.editorLinkMiddleware.${
              middlewareId + '_ml'
            }(event)`,
            class: 'text-green cursor-pointer relative dark:text-yellow',
          },
        }),
        Underline.configure({
          HTMLAttributes: {
            class: 'underline',
          },
        }),
        Placeholder.configure({
          placeholder:
            translations.value.page.entry.editor.placeholder.placeholder,
          showOnlyWhenEditable: false,
          showOnlyCurrent: false,
        }),
      ];
      if (store.getters.feature_available('content_sync')) {
        extensions.push(
          Collaboration.configure({
            document: ydoc,
          }),
        );
      }
      if (!props.disallowWidgets) {
        extensions.push(BCMSWidget);
      }
      if (props.showCollaborationCursor && props.user) {
        // extensions.push(
        //   CollaborationCursor.configure({
        //     provider: yProvider,
        //     user: {
        //       name: props.user.username,
        //       color: `${
        //         window.bcms.util.color.colors[
        //           parseInt(props.user._id, 16) %
        //             window.bcms.util.color.colors.length
        //         ].main
        //       }; color: white;`,
        //     },
        //   })
        // );
      }
      return useEditor({
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [],
            },
          ],
        },
        extensions,
      });
    }
    async function create() {
      lngBuffer = props.lng || '';
      idBuffer = props.id;
      nodesBuffer = JSON.stringify(props.content.nodes || {});
      entryIdBuffer = BCMSEntrySyncService.entry?.value?._id || '';
      const maxTime = Date.now() + 10000;
      await throwable(async () => {
        await window.bcms.sdk.widget.getAll();
      });
      function checkEditorCallback() {
        if (maxTime < Date.now()) {
          console.error('Content editor ready timeout of 10s excide.');
        }
        if (editor.value) {
          ctx.emit('editorReady', editor.value, ydoc);
        } else {
          setTimeout(checkEditorCallback, 100);
        }
      }
      if (!editor.value) {
        setTimeout(checkEditorCallback);
      } else {
        ctx.emit('editorReady', editor.value, ydoc);
      }
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
      await create();
      if (props.entrySync) {
        entrySyncUnsub = props.entrySync.onChange((event) => {
          if (event.sct === BCMSSocketSyncChangeType.PROP) {
            const data = event.data as BCMSSocketSyncChangeDataProp;
            if ((data as any).cu && data.p === props.propPath) {
              const cu = (data as any).cu;
              if (ydoc) {
                if (cu.updates) {
                  Y.applyUpdate(ydoc, Uint8Array.from(cu.updates));
                } else if (cu.stateUpdate) {
                  const otherState = Uint8Array.from(cu.stateUpdate);
                  Y.applyUpdate(ydoc, otherState);
                }
              }
            }
          }
        });
      }
      if (editor.value) {
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
      if (store.getters.feature_available('content_sync')) {
        ydoc.on('update', (updates) => {
          ctx.emit(
            'updateContent',
            props.propPath || 'none',
            Array.from(updates),
          );
        });
        yProvider.sync(props.content.nodes);
      } else {
        editor.value?.commands.setContent({
          type: 'doc',
          content:
            props.content.nodes.length > 0
              ? props.content.nodes
              : [
                  {
                    type: 'paragraph',
                    content: [],
                  },
                ],
        });
      }
      editor.value?.on('update', () => {
        nodesBuffer = JSON.stringify(editor.value?.getJSON().content);
      });
    });

    onBeforeUpdate(async () => {
      if (
        lngBuffer !== props.lng ||
        idBuffer !== props.id ||
        BCMSEntrySyncService.entry?.value?._id !== entryIdBuffer ||
        nodesBuffer !== JSON.stringify(props.content.nodes || {})
      ) {
        if (editor.value) {
          editor.value.commands.clearContent();
          setTimeout(async () => {
            (editor as any).value.commands.setContent({
              type: 'doc',
              content:
                props.content.nodes.length > 0
                  ? props.content.nodes
                  : [
                      {
                        type: 'paragraph',
                        content: [],
                      },
                    ],
            });
            await create();
          }, 20);
        }
      }
    });

    onBeforeUnmount(() => {
      if (entrySyncUnsub) {
        entrySyncUnsub();
      }
      if (editor.value) {
        editor.value.destroy();
      }
      if (window.bcms.editorLinkMiddleware[middlewareId]) {
        delete window.bcms.editorLinkMiddleware[middlewareId];
        delete window.bcms.editorLinkMiddleware[middlewareId + '_me'];
        delete window.bcms.editorLinkMiddleware[middlewareId + '_ml'];
      }
      yProvider.destroy();
    });

    return () => (
      <div class={`relative ${rootClass}`} data-bcms-prop-path={props.propPath}>
        <Toolbar
          class="relative text-grey flex items-center bg-white min-w-max rounded-2.5 p-0.5 shadow-cardLg desktop:absolute desktop:bottom-2.5"
          editor={editor.value}
        />
        <EditorContent
          class={`${rootClass}--content ${
            props.inMeta ? rootClass + '--content_meta' : ''
          } ${props.invalidText ? rootClass + '--content_error' : ''}`}
          editor={editor.value}
        />
        {props.invalidText && (
          <span class="flex font-normal not-italic text-xs leading-normal tracking-0.06 select-none text-red dark:text-red mt-1.5">
            {props.invalidText}
          </span>
        )}
      </div>
    );
  },
});
export default component;
