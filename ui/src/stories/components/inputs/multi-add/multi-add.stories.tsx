import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSMultiAddInputPreview from './Preview.tsx';
import BCMSMultiAddInput from './Index.tsx';

const value = ['Option 1', 'Option 2'];

const meta: Meta<typeof BCMSMultiAddInput> = {
  title: 'Components/Inputs/Multi Add',
  component: BCMSMultiAddInput,
  render: (args) => ({
    components: {
      BCMSMultiAddInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSMultiAddInputPreview
        :class="props.class"
        :label="props.label"
        :value="props.value"
        :placeholder="props.placeholder"
        :invalid-text="props.invalidText"
        :helper-text="props.helperText"
        :disabled="props.disabled"
        :format="props.format"
        :validate="props.validate"
      />
    `,
  }),
  args: {
    value,
  },
  argTypes: {
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Multi Add label',
    },
    value: {
      control: 'object',
      description: 'Array of strings',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable multi add interaction',
    },
    format: {
      control: false,
      description:
        'Function to modify the value before it is added to the list',
    },
    validate: {
      control: false,
      description:
        'Function to validate all values before adding a new one to the list',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSMultiAddInput>;

export const Preview: Story = {
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
        props: args,
      };
    },
    template: `
    <BCMSMultiAddInput
      :class="props.class"
      :label="props.label"
      :value="props.value"
      :placeholder="props.placeholder"
      :invalid-text="props.invalidText"
      :helper-text="props.helperText"
      disabled
      :format="props.format"
      :validate="props.validate"
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
        props: args,
      };
    },
    template: `
    <BCMSMultiAddInput
      :class="props.class"
      :label="props.label"
      :value="props.value"
      :placeholder="props.placeholder"
      invalid-text="Error text"
      :helper-text="props.helperText"
      :disabled="props.disabled"
      :format="props.format"
      :validate="props.validate"
    />
    `,
  }),
};
