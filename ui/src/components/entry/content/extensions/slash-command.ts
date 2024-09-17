import { Extension } from '@tiptap/core';
import tippy from 'tippy.js';
import type { Instance, Props } from 'tippy.js';
import { Suggestion, type SuggestionProps } from '@tiptap/suggestion';
import { type CommandProps, type Range, VueRenderer } from '@tiptap/vue-3';
import type { Sdk } from '@thebcms/selfhosted-sdk';
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import {
    SlackCommandList,
    type SlashCommandListItem,
} from '@bcms/selfhosted-ui/components/entry/content/extensions/slash-command-list';
import { propValuesFromSchema } from '@bcms/selfhosted-ui/util/prop';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';

export interface SlashCommandData {
    editor: CommandProps;
    range: Range;
}

export function createSlashCommandExtension({
    allowedWidgets,
    sdk,
    basePath,
}: {
    allowedWidgets?: string[];
    sdk: Sdk;
    basePath: string;
}): Extension<any> {
    const throwable = window.bcms.throwable;
    return Extension.create({
        name: 'mention',
        addOptions() {
            return {
                suggestion: {
                    char: '/',
                    startOfLine: true,
                    command: ({ editor, range, props }: any) => {
                        props.command({ editor, range });
                    },
                },
            };
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
                const store = sdk.store;
                const widgets: Widget[] = JSON.parse(
                    JSON.stringify(
                        allowedWidgets
                            ? store.widget.findMany((e) =>
                                  allowedWidgets.includes(e._id),
                              )
                            : store.widget.items(),
                    ),
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

                const wdgts: Array<SlashCommandListItem> = [];
                await throwable(async () => {
                    await sdk.group.getAll();
                    await sdk.widget.getAll();
                });

                for (let i = 0; i < widgets.length; i++) {
                    const widget = widgets[i];
                    if (
                        !allowedWidgets ||
                        allowedWidgets.includes(widget._id)
                    ) {
                        const values = await propValuesFromSchema(widget.props);
                        let media: Media | undefined = undefined;
                        if (widget.previewImage) {
                            await throwable(
                                async () => {
                                    return await sdk.media.get({
                                        mediaId: widget.previewImage,
                                    });
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
                            icon: `/feather`,
                            image: media,
                            command: (data) => {
                                return data.editor.chain().setWidget({
                                    data: {
                                        _id: widget._id,
                                        props: values,
                                    },
                                    propPath: basePath,
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
                let component: VueRenderer;
                let popup: Instance<Props>[];

                return {
                    onStart: (props: SuggestionProps) => {
                        component = new VueRenderer(SlackCommandList, {
                            props: props,
                            editor: props.editor,
                        });

                        popup = tippy('body', {
                            getReferenceClientRect:
                                props.clientRect as () => DOMRect,
                            appendTo: () => document.body,
                            content: component.element,
                            showOnCreate: true,
                            interactive: true,
                            trigger: 'manual',
                            placement: 'bottom-start',
                        });
                    },
                    onUpdate(props: any) {
                        component.updateProps(props);

                        if (popup[0]) {
                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
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
                        return component.ref?.onKeyDown(_props);
                    },
                    onExit() {
                        if (popup[0]) {
                            popup[0].destroy();
                        }
                        component.destroy();
                    },
                };
            },
        },
    } as any);
}
