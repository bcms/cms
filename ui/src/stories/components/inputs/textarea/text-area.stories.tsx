import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSTextAreaInputPreview from './Preview.tsx';
import BCMSTextAreaInput from './Index.tsx';

const meta: Meta<typeof BCMSTextAreaInput> = {
  title: 'Components/Inputs/Text Area',
  component: BCMSTextAreaInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSTextAreaInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSTextAreaInputPreview
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
    invalidText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    helperText: {
      control: 'text',
    },
    format: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSTextAreaInput>;

export const Playground: Story = {
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
    disabled: true,
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
        args,
      };
    },
    template: `
    <BCMSTextAreaInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
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
      BCMSTextAreaInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSTextAreaInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      @input="args.value = $event"
    />
    `,
  }),
};
