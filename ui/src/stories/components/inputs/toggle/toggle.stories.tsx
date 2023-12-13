import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSToggleInputPreview from './Preview.tsx';
import BCMSToggleInput from './Index.tsx';

const meta: Meta<typeof BCMSToggleInput> = {
  title: 'Components/Inputs/Toggle',
  component: BCMSToggleInput,
  render: (args) => ({
    components: {
      BCMSToggleInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSToggleInputPreview
        :class="props.class"
        :value="props.value"
        :label="props.label"
        :disabled="props.disabled"
        :states="props.states"
        :helper-text="props.helperText"
        @input="props.value = !props.value"
      />
    `,
  }),
  args: {
    states: ['On', 'Off'],
  },
  argTypes: {
    value: {
      control: 'boolean',
      description: 'true/false',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Toggle label',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable toggle interaction',
    },
    states: {
      control: 'object',
      description: 'Toggle state labels',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSToggleInput>;

export const Preview: Story = {
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
        props: args,
      };
    },
    template: `
    <BCMSToggleInput
      :class="props.class"
      value
      :label="props.label"
      :disabled="props.disabled"
      :states="props.states"
      :helper-text="props.helperText"
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
        props: args,
      };
    },
    template: `
    <BCMSToggleInput
      :class="props.class"
      :value="false"
      :label="props.label"
      :disabled="props.disabled"
      :states="props.states"
      :helper-text="props.helperText"
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
        props: args,
      };
    },
    template: `
    <BCMSToggleInput
      :class="props.class"
      :value="props.value"
      :label="props.label"
      disabled
      :states="props.states"
      :helper-text="props.helperText"
    />
    `,
  }),
};
