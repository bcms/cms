import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSTextInputPreview from './Preview.tsx';
import BCMSTextInput from './Index.tsx';

const meta: Meta<typeof BCMSTextInput> = {
  title: 'Components/Inputs/Text',
  component: BCMSTextInput,
  render: (args) => ({
    components: {
      BCMSTextInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSTextInputPreview
        :class="props.class"
        :value="props.value"
        :placeholder="props.placeholder"
        :label="props.label"
        :type="props.type"
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
      description: 'Text label',
    },
    type: {
      control: 'select',
      options: ['text', 'email'],
      description: 'Input type',
      table: {
        defaultValue: {
          summary: 'text',
        },
      },
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable text interaction',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSTextInput>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSTextInput
  class={props.class}
  value={props.value}
  placeholder={props.placeholder}
  label={props.label}
  type={props.type}
  invalid-text={props.invalidText}
  disabled={props.disabled}
  helper-text={props.helperText}
  onInput="(val) => props.value = val"
/>

\`.vue\`
<template>
  <BCMSTextInput
    :class="props.class"
    :value="props.value"
    :placeholder="props.placeholder"
    :label="props.label"
    :type="props.type"
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
      BCMSTextInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSTextInput
      :class="props.class"
      :value="props.value"
      :placeholder="props.placeholder"
      :label="props.label"
      :type="props.type"
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
      BCMSTextInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSTextInput
      :class="props.class"
      :value="props.value"
      :placeholder="props.placeholder"
      :label="props.label"
      :type="props.type"
      :invalid-text="props.invalidText"
      :disabled="props.disabled"
      :helper-text="props.helperText"
      @input="props.value = $event"
    />
    `,
  }),
};
