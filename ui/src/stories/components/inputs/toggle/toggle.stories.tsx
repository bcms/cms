import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSToggleInputPreview from './Preview.tsx';
import BCMSToggleInput from './Index.tsx';

const meta: Meta<typeof BCMSToggleInput> = {
  title: 'Components/Inputs/Toggle',
  component: BCMSToggleInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSToggleInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSToggleInputPreview
        :class="args.class"
        :value="args.value"
        :label="args.label"
        :disabled="args.disabled"
        :states="args.states"
        :helper-text="args.helperText"
        @input="args.value = !args.value"
        />
        `,
  }),
  args: {
    states: ['On', 'Off'],
  },
  argTypes: {
    value: {
      control: 'boolean',
    },
    class: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    states: {
      control: 'object',
    },
    helperText: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSToggleInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSToggleInput
  class={props.class}
  value={props.value}
  label={props.label}
  disabled={props.disabled}
  states={props.states}
  helper-text={props.helperText}
  onInput={() => props.value = !props.value}
/>

\`.vue\`
<template>
  <BCMSToggleInput
    :class="props.class"
    :value="props.value"
    :label="props.label"
    :disabled="props.disabled"
    :states="props.states"
    :helper-text="props.helperText"
    @input="props.value = !props.value"
  />
</template>
        `,
      },
    },
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked',
  },
  argTypes: {
    value: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSToggleInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSToggleInput
      :class="args.class"
      value
      :label="args.label"
      :disabled="args.disabled"
      :states="args.states"
      :helper-text="args.helperText"
    />
    `,
  }),
};

export const Unchecked: Story = {
  args: {
    label: 'Unchecked',
  },
  argTypes: {
    value: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSToggleInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSToggleInput
      :class="args.class"
      :value="false"
      :label="args.label"
      :disabled="args.disabled"
      :states="args.states"
      :helper-text="args.helperText"
    />
    `,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
  },
  argTypes: {
    disabled: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSToggleInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSToggleInput
      :class="args.class"
      :value="args.value"
      :label="args.label"
      disabled
      :states="args.states"
      :helper-text="args.helperText"
    />
    `,
  }),
};
