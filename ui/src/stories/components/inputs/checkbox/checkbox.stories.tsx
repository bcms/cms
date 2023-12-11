import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSCheckboxInputPreview from './Preview.tsx';
import BCMSCheckboxInput from './Index.tsx';

const meta: Meta<typeof BCMSCheckboxInput> = {
  title: 'Components/Inputs/Checkbox',
  component: BCMSCheckboxInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSCheckboxInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSCheckboxInputPreview
        :class="args.class"
        :value="args.value"
        :label="args.label"
        :invalid-text="args.invalidText"
        :disabled="args.disabled"
        :helper-text="args.helperText"
        :description="args.description"
        @input="args.value = !args.value"
      />
    `,
  }),
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
    invalidText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    helperText: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSCheckboxInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSCheckboxInput
  class={props.class}
  value={props.value}
  label={props.label}
  invalid-text={props.invalidText}
  disabled={props.disabled}
  helper-text={props.helperText}
  description={props.description}
  onInput={() => props.value = !props.value}
/>

\`.vue\`
<template>
  <BCMSCheckboxInput
    :class="props.class"
    :value="props.value"
    :label="props.label"
    :invalid-text="props.invalidText"
    :disabled="props.disabled"
    :helper-text="props.helperText"
    :description="props.description"
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
      BCMSCheckboxInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="args.class"
      value
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      :description="args.description"
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
      BCMSCheckboxInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="args.class"
      :value="false"
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      :description="args.description"
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
      BCMSCheckboxInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="args.class"
      :value="args.value"
      :label="args.label"
      :invalid-text="args.invalidText"
      disabled
      :helper-text="args.helperText"
      :description="args.description"
    />
    `,
  }),
};

export const Error: Story = {
  args: {
    invalidText: 'Error text',
  },
  argTypes: {
    invalidText: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSCheckboxInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="args.class"
      :value="args.value"
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      :description="args.description"
      @input="args.value = !args.value"
    />
    `,
  }),
};
