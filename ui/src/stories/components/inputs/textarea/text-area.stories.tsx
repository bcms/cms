import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSTextAreaInputPreview from './Preview.tsx';
import BCMSTextAreaInput from './Index.tsx';

const meta: Meta<typeof BCMSTextAreaInput> = {
  title: 'Components/Inputs/Text Area',
  component: BCMSTextAreaInput,
  render: (args) => ({
    components: {
      BCMSTextAreaInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSTextAreaInputPreview
        :class="props.class"
        :value="props.value"
        :placeholder="props.placeholder"
        :label="props.label"
        :invalid-text="props.invalidText"
        :disabled="props.disabled"
        :helper-text="props.helperText"
        @input="($event) => props.value = $event.value"
      />
    `,
  }),
  argTypes: {
    value: {
      control: 'text',
      description: 'Text',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    label: {
      control: 'text',
      description: 'Textarea label',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable textarea interaction',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
    format: {
      control: 'object',
      description: 'Function to modify the value before it is emitted.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSTextAreaInput>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSTextAreaInput
  class={props.class}
  value={props.value}
  placeholder={props.placeholder}
  label={props.label}
  invalid-text={props.invalidText}
  disabled={props.disabled}
  helper-text={props.helperText}
  onInput="(val) => props.value = val"
/>

\`.vue\`
<template>
  <BCMSTextAreaInput
    :class="props.class"
    :value="props.value"
    :placeholder="props.placeholder"
    :label="props.label"
    :invalid-text="props.invalidText"
    :disabled="props.disabled"
    :helper-text="props.helperText"
    @input="props.value = $event"
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
  },
  argTypes: {
    disabled: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSTextAreaInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSTextAreaInput
      :class="props.class"
      :value="props.value"
      :placeholder="props.placeholder"
      :label="props.label"
      :invalid-text="props.invalidText"
      disabled
      :helper-text="props.helperText"
      @input="props.value = $event"
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
      BCMSTextAreaInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSTextAreaInput
      :class="props.class"
      :value="props.value"
      :placeholder="props.placeholder"
      :label="props.label"
      :invalid-text="props.invalidText"
      :disabled="props.disabled"
      :helper-text="props.helperText"
      @input="props.value = $event"
    />
    `,
  }),
};
