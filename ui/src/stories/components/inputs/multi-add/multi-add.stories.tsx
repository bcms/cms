import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSMultiAddInputPreview from './Preview.tsx';
import BCMSMultiAddInput from './Index.tsx';

const value = ['Option 1', 'Option 2'];

const meta: Meta<typeof BCMSMultiAddInput> = {
  title: 'Components/Inputs/Multi Add',
  component: BCMSMultiAddInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSMultiAddInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSMultiAddInputPreview
        :class="args.class"
        :label="args.label"
        :value="args.value"
        :placeholder="args.placeholder"
        :invalid-text="args.invalidText"
        :helper-text="args.helperText"
        :disabled="args.disabled"
        :format="args.format"
        :validate="args.validate"
      />
    `,
  }),
  args: {
    value,
  },
  argTypes: {
    class: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    value: {
      control: 'object',
    },
    placeholder: {
      control: 'text',
    },
    invalidText: {
      control: 'text',
    },
    helperText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    format: {
      control: false,
    },
    validate: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSMultiAddInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSMultiAddInput
  class={props.class}
  label={props.label}
  value={props.value}
  placeholder={props.placeholder}
  invalid-text={props.invalidText}
  helper-text={props.helperText}
  disabled={props.disabled}
  format={props.format}
  validate={props.validate}
  onInput={(val) => props.value = val}
/>

\`.vue\`
<template>
  <BCMSMultiAddInput
    :class="props.class"
    :label="props.label"
    :value="props.value"
    :placeholder="props.placeholder"
    :invalid-text="props.invalidText"
    :helper-text="props.helperText"
    :disabled="props.disabled"
    :format="props.format"
    :validate="props.validate"
    @input="props.val = $event"
  />
</template>
        `,
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    value,
  },
  argTypes: {
    disabled: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSMultiAddInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSMultiAddInput
      :class="args.class"
      :label="args.label"
      :value="args.value"
      :placeholder="args.placeholder"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      disabled
      :format="args.format"
      :validate="args.validate"
    />
    `,
  }),
};

export const Error: Story = {
  args: {
    label: 'Error',
    value,
  },
  argTypes: {
    invalidText: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSMultiAddInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSMultiAddInput
      :class="args.class"
      :label="args.label"
      :value="args.value"
      :placeholder="args.placeholder"
      invalid-text="Error text"
      :helper-text="args.helperText"
      :disabled="args.disabled"
      :format="args.format"
      :validate="args.validate"
    />
    `,
  }),
};
