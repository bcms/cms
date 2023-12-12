import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSCodeEditor from './Index.tsx';

const meta: Meta<typeof BCMSCodeEditor> = {
  title: 'Components/Code Editor',
  component: BCMSCodeEditor,
  render: (args) => ({
    components: {
      BCMSCodeEditor,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSCodeEditor
        :class="props.class"
        :code="props.code"
        :read-only="props.readOnly"
      />
    `,
  }),
  args: {
    code: `
for (let index = 0; index < array.length; index++) {
  const element = array[index];
  
  console.log(element);
}
    `,
  },
  argTypes: {
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    code: {
      control: 'text',
      description: 'Code snippet',
    },
    readOnly: {
      control: 'boolean',
      description: 'Disable code change',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BCMSCodeEditor>;

export const Preview: Story = {
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
