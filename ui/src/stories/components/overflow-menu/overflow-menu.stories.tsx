import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSOverflowMenu from './Index.tsx';

const meta: Meta<typeof BCMSOverflowMenu> = {
  title: 'Components/Overflow Menu/Overflow Menu',
  component: BCMSOverflowMenu,
  render: (args) => ({
    components: {
      BCMSOverflowMenu,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSOverflowMenu
        :class="args.class"
        :position="args.position"
        :options-width="args.optionsWidth"
        :orientation="args.orientation"
        :title="args.title"
      >
        {{ args.slot }}
      </BCMSOverflowMenu>
    `,
  }),
  argTypes: {
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    position: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Position of the menu',
      table: {
        defaultValue: {
          summary: 'left',
        },
      },
    },
    optionsWidth: {
      control: 'number',
      description: 'Width of the menu',
      table: {
        defaultValue: {
          summary: 215,
        },
      },
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: 'Orientation of the dots icon',
      table: {
        defaultValue: {
          summary: 'vertical',
        },
      },
    },
    title: {
      control: 'text',
      description: 'Title of the menu',
      table: {
        defaultValue: {
          summary: 'Options',
        },
      },
    },
    slot: {
      control: 'text',
      description: 'BCMSOverflowMenuItem component',
      name: 'default slot',
    },
  },
  decorators: [
    () => ({
      template: `
      <div>
        <story />
        <div id="bcmsOverflowList" />
      </div>`,
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof BCMSOverflowMenu>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSOverflowMenu
  class={props.class}
  position={props.position}
  options-width={props.optionsWidth}
  orientation={props.orientation}
  title={props.title}
>
  <BCMSOverflowMenuItem
    text="Edit"
    icon="edit"
    description="Edit description"
    onClick={() => {}}
  />
  <BCMSOverflowMenuItem
    text="Notifications"
    icon="bell"
    onClick={() => {}}
  />
  <BCMSOverflowMenuItem
    text="Remove"
    icon="trash"
    theme="danger"
    onClick={() => {}}
  />
</BCMSOverflowMenu>

\`.vue\`
<template>
  <BCMSOverflowMenu
    :class="props.class"
    :position="props.position"
    :options-width="props.optionsWidth"
    :orientation="props.orientation"
    :title="props.title"
  >
  <BCMSOverflowMenuItem
    text="Edit"
    icon="edit"
    description="Edit description"
    @click={() => {}}
  />
  <BCMSOverflowMenuItem
    text="Notifications"
    icon="bell"
    @click={() => {}}
  />
  <BCMSOverflowMenuItem
    text="Remove"
    icon="trash"
    theme="danger"
    @click={() => {}}
  />
  </BCMSOverflowMenu>
</template>
        `,
      },
    },
  },
};
