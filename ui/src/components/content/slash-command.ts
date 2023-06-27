/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BCMSMedia, BCMSWidget } from '@becomes/cms-sdk/types';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionProps } from '@tiptap/suggestion';
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';
import type { Instance, Props } from 'tippy.js';
import type {
  BCMSPropValueExtended,
  SlashCommandData,
  SlashCommandItem,
} from '../../types';
import CommandsList from './slash-command-list';

export function createBcmsSlashCommand({
  allowedWidgets,
}: {
  allowedWidgets?: string[];
}): Extension<any> {
  return Extension.create({
    name: 'mention',
    defaultOptions: {
      suggestion: {
        char: '/',
        startOfLine: true,
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
          bane: 'WTF',
        } as any),
      ];
    },
  }).configure({
    suggestion: {
      async items({ query }: { query: string }) {
        const store = window.bcms.vue.store;
        const widgets: BCMSWidget[] = JSON.parse(
          JSON.stringify(store.getters.widget_items),
        );
        widgets.sort((a, b) => (a.name < b.name ? -1 : 1));

        const headings = new Array(6).fill({}).map((_, index) => {
          return {
            id: '' + index,
            title: `Heading ${index + 1}`,
            icon: `/editor/heading/h${index + 1}`,
            type: 'primary',
            command: (data: SlashCommandData) => {
              data.editor
                .chain()
                .focus()
                .deleteRange(data.range)
                .setNode('heading', { level: index + 1 })
                .run();
            },
          };
        });

        const wdgts: Array<SlashCommandItem> = [];

        for (let i = 0; i < widgets.length; i++) {
          const widget = widgets[i];
          if (!allowedWidgets || allowedWidgets.includes(widget._id)) {
            const values: BCMSPropValueExtended[] = [];
            for (let j = 0; j < widget.props.length; j++) {
              const prop = widget.props[j];
              await window.bcms.util.throwable(async () => {
                await window.bcms.sdk.group.getAll();
                await window.bcms.sdk.widget.getAll();
              });
              const propExtended = await window.bcms.prop.toPropValueExtended({
                prop,
                lang: '',
              });

              if (propExtended) {
                values.push(propExtended);
              }
            }

            let media: BCMSMedia | undefined = undefined;
            if (widget.previewImage) {
              await window.bcms.util.throwable(
                async () => {
                  return await window.bcms.sdk.media.getById(
                    widget.previewImage,
                  );
                },
                async (result) => {
                  media = result;
                },
              );
            }

            wdgts.push({
              id: widget._id,
              title: `${widget.label}`,
              widget: true,
              icon: `/administration/widget`,
              image: media,
              command: (data) => {
                return data.editor.chain().setWidget({
                  widget: JSON.stringify(widget) as any,
                  content: JSON.stringify(values) as any,
                  lang: '',
                  basePath: 'cen',
                });
              },
            });
          }
        }
        if (!query) {
          query = '';
        }

        return [
          ...headings,
          {
            id: 'p1',
            title: 'Paragraph',
            icon: '/editor/text',
            type: 'primary',
            command: (data: SlashCommandData) => {
              data.editor
                .chain()
                .focus()
                .deleteRange(data.range)
                .setNode('paragraph')
                .run();
            },
          },
          {
            id: 'p2',
            title: 'Bullet List',
            icon: '/editor/list-ul',
            type: 'primary',
            command: (data: SlashCommandData) => {
              (data.editor as any)
                .chain()
                .focus()
                .deleteRange(data.range)
                .toggleBulletList()
                .run();
            },
          },
          {
            id: 'p3',
            title: 'Ordered List',
            icon: '/editor/list-ol',
            type: 'primary',
            command: (data: SlashCommandData) => {
              (data.editor as any)
                .chain()
                .focus()
                .deleteRange(data.range)
                .toggleOrderedList()
                .run();
            },
          },
          {
            id: 'p4',
            title: 'Code Block',
            icon: '/editor/code',
            type: 'primary',
            command: (data: SlashCommandData) => {
              data.editor
                .chain()
                .focus()
                .deleteRange(data.range)
                .setNode('codeBlock')
                .run();
            },
          },
          ...wdgts,
        ].filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        );
      },
      render: () => {
        let _component: VueRenderer;
        let popup: Instance<Props>[];

        return {
          onStart: (_props: SuggestionProps) => {
            _component = new VueRenderer(CommandsList, {
              props: _props,
              editor: _props.editor,
            });

            popup = tippy('body', {
              getReferenceClientRect: _props.clientRect as () => DOMRect,
              appendTo: () => document.body,
              content: _component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },
          onUpdate(_props: any) {
            _component.updateProps(_props);

            if (popup[0]) {
              popup[0].setProps({
                getReferenceClientRect: _props.clientRect,
              });
            }
          },
          onKeyDown(_props: any) {
            if (_props.event.key === 'Escape') {
              if (popup[0]) {
                popup[0].hide();
              }

              return true;
            }
            return _component.ref?.onKeyDown(_props);
          },
          onExit() {
            if (popup[0]) {
              popup[0].destroy();
            }
            _component.destroy();
          },
        };
      },
    },
  } as any);
}
