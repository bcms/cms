import { Mark, mergeAttributes } from '@tiptap/core';

export interface BCMSInlineCodeMarkOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineCode: {
      /**
       * Set an italic mark
       */
      setInlineCode: () => ReturnType;
      /**
       * Toggle an italic mark
       */
      toggleInlineCode: () => ReturnType;
      /**
       * Unset an italic mark
       */
      unsetInlineCode: () => ReturnType;
    };
  }
}

export const BCMSInlineCodeMark = Mark.create<BCMSInlineCodeMarkOptions>({
  name: 'inlineCode',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'code',
        getAttrs: (node) =>
          (node as HTMLElement).style.fontStyle !== 'normal' && null,
      },
      {
        style: 'font-style=monospace',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'code',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addCommands() {
    return {
      setInlineCode:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleInlineCode:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetInlineCode:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
