import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSCodeEditor from './Index.tsx';

const meta: Meta<typeof BCMSCodeEditor> = {
  title: 'Components/Code Editor',
  component: BCMSCodeEditor,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSCodeEditor,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSCodeEditor
        :class="args.class"
        :code="args.code"
        :read-only="args.readOnly"
      />
    `,
  }),
  args: {
    code: `
<BCMSCodeEditor
  :class="props.class"
  :code="props.code"
  :read-only="props.readOnly"
/>
    `,
  },
  argTypes: {
    class: {
      control: 'text',
    },
    code: {
      control: 'text',
    },
    readOnly: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BCMSCodeEditor>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<BCMSCodeEditor
  :class="props.class"
  :code="props.code"
  :read-only="props.readOnly"
/>
        `,
      },
    },
  },
};
