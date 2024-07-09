import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import { EntryContentNodeWidgetComponent } from './widget-component';
import type { EntryContentNodeWidgetAttr } from '@thebcms/selfhosted-backend/entry/models/content';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        widget: {
            /**
             * Set a heading node
             */
            setWidget: (attributes: EntryContentNodeWidgetAttr) => ReturnType;
            removeWidget: (attributes: { widget: Widget }) => ReturnType;
        };
    }
}

export const EntryContentNodeWidgetNodeConfig: Node = Node.create({
    name: 'widget',
    group: 'block',
    atom: true,
    defining: true,
    draggable: true,
    isolating: true,

    addCommands() {
        return {
            setWidget: (attrs) => (data) => {
                const path = (data.state.selection.$anchor as any).path;
                if ((data.state.selection.$anchor as any).path.length !== 6) {
                    return false;
                }
                return data.editor
                    .chain()
                    .focus()
                    .insertContentAt(
                        {
                            from: path[2],
                            to: path[2] + path[3].content.size + 1,
                        },
                        {
                            type: 'widget',
                            attrs,
                        },
                    )
                    .run();
            },
            removeWidget: (_attrs) => (data) => {
                return data.editor.chain().focus().deleteSelection().run();
            },
        };
    },
    addAttributes() {
        return {
            data: {
                default: undefined,
                parseHTML: (element) => element.getAttribute('widget'),
            },
            entryId: {
                default: undefined,
                parseHTML: (element) => element.getAttribute('entryId'),
            },
            propPath: {
                default: 'w',
                parseHTML: (element) => element.getAttribute('propPath'),
            },
        };
    },

    onUpdate() {
        const path = (this.editor.state.selection.$anchor as any).path;
        const widgetAttrs = this.editor.getAttributes('widget');
        if (widgetAttrs.widget) {
            if (path.length > 3) {
                (this.editor.commands as any).undo();
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'widget',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'widget',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        ];
    },

    addNodeView() {
        return VueNodeViewRenderer(EntryContentNodeWidgetComponent);
    },
});
