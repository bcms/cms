import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSOverflowMenuItem from './Index.tsx';
import BCMSOverflowMenuItemPreview from './Preview.tsx';

const meta: Meta<typeof BCMSOverflowMenuItem> = {
  title: 'Components/Overflow Menu/Overflow Menu Item',
  component: BCMSOverflowMenuItemPreview,
  render: (args) => ({
    components: {
      BCMSOverflowMenuItemPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSOverflowMenuItemPreview
        :class="props.class"
        :text="props.text"
        :description="props.description"
        :theme="props.theme"
        :icon="props.icon"
      />
    `,
  }),
  args: {
    text: 'Edit',
  },
  argTypes: {
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    text: {
      control: 'text',
      description: "Item's label",
    },
    description: {
      control: 'text',
      description: "Item's description",
    },
    theme: {
      control: 'select',
      options: ['default', 'danger'],
      description: "Item's theme",
      table: {
        defaultValue: {
          summary: 'default',
        },
      },
    },
    icon: {
      control: 'text',
      description: 'Path to icon',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BCMSOverflowMenuItem>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
  <BCMSOverflowMenuItem
    class={props.class}
    text={props.text}
    description={props.description}
    theme={props.theme}
    icon={props.icon}
    onClick={() => {}}
  />

\`.vue\`
<template>
  <BCMSOverflowMenuItem
    :class="props.class"
    :text="props.text"
    :description="props.description"
    :theme="props.theme"
    :icon="props.icon"
    @click={() => {}}
  />
</template>
        `,
      },
    },
  },
};

export const Danger: Story = {
  args: {
    text: 'Danger',
  },
  argTypes: {
    theme: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSOverflowMenuItem,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSOverflowMenuItem
      :class="props.class"
      :text="props.text"
      :description="props.description"
      theme="danger"
      :icon="props.icon"
    />
    `,
  }),
};
