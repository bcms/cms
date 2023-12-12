import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSOverflowMenu from './Index.tsx';

const meta: Meta<typeof BCMSOverflowMenu> = {
  title: 'Components/Overflow Menu',
  component: BCMSOverflowMenu,
  // tags: ['autodocs'],
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
    },
    position: {
      control: 'select',
      options: ['left', 'right'],
    },
    optionsWidth: {
      control: 'number',
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    title: {
      control: 'text',
    },
    slot: {
      control: 'text',
      description: 'Text or HTML',
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

export const Playground: Story = {
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
      @click={() => {}}
    />
  </BCMSOverflowMenu>
</template>
        `,
      },
    },
  },
};
