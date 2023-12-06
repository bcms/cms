import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSNumberInputPreview from './Preview.tsx';
import BCMSNumberInput from './Index.tsx';

const meta: Meta<typeof BCMSNumberInput> = {
  title: 'Components/Inputs/Number',
  component: BCMSNumberInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSNumberInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSNumberInputPreview
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
      control: 'number',
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
  },
};

export default meta;
type Story = StoryObj<typeof BCMSNumberInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSNumberInput
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
  <BCMSNumberInput
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
      BCMSNumberInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSNumberInput
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
      BCMSNumberInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSNumberInput
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
