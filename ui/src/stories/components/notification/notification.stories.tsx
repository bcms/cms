import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSNotification from './Index.tsx';

const meta: Meta<typeof BCMSNotification> = {
  title: 'Components/Notification',
  component: BCMSNotification,
  render: (args) => ({
    components: {
      BCMSNotification,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSNotification
        :type="args.type"
        :content="args.content"
      />
    `,
  }),
  args: {
    type: 'success',
    content: 'Notification message',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning'],
      description: 'Notification type',
    },
    content: {
      control: 'text',
      description: 'Text',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BCMSNotification>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`script\`
window.bcms.notification.success('Notification message');

\`template\`
<BCMSNotification />
        `,
      },
    },
  },
};
