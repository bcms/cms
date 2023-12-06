import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSTextInputPreview from './Preview.tsx';
import BCMSTextInput from './Index.tsx';

const meta: Meta<typeof BCMSTextInput> = {
  title: 'Components/Inputs/Text',
  component: BCMSTextInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSTextInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSTextInputPreview
        :class="args.class"
        :value="args.value"
        :placeholder="args.placeholder"
        :label="args.label"
        :invalid-text="args.invalidText"
        :disabled="args.disabled"
        :helper-text="args.helperText"
        @input="($event) => args.value = $event.value"
      />
    `,
  }),
  argTypes: {
    value: {
      control: 'text',
    },
    class: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    type: {
      control: 'select',
      options: ['text', 'email'],
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
  },
};

export default meta;
type Story = StoryObj<typeof BCMSTextInput>;

export const Playground: Story = {
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
    disabled: true,
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
        args,
      };
    },
    template: `
    <BCMSTextInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :type="args.type"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      @input="args.value = $event"
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
        args,
      };
    },
    template: `
    <BCMSTextInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :type="args.type"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      @input="args.value = $event"
    />
    `,
  }),
};
