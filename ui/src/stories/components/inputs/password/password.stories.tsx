import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSPasswordInputPreview from './Preview.tsx';
import BCMSPasswordInput from './Index.tsx';

const meta: Meta<typeof BCMSPasswordInput> = {
  title: 'Components/Inputs/Password',
  component: BCMSPasswordInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSPasswordInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSPasswordInputPreview
        :class="args.class"
        :value="args.value"
        :placeholder="args.placeholder"
        :label="args.label"
        :invalid-text="args.invalidText"
        :disabled="args.disabled"
        :helper-text="args.helperText"
        :readonly="args.readonly"
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
    readonly: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSPasswordInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSPasswordInput
  class={props.class}
  value={props.value}
  placeholder={props.placeholder}
  label={props.label}
  invalid-text={props.invalidText}
  disabled={props.disabled}
  helper-text={props.helperText}
  readonly={props.readonly}
  onInput="(val) => props.value = val"
/>

\`.vue\`
<template>
  <BCMSPasswordInput
    :class="props.class"
    :value="props.value"
    :placeholder="props.placeholder"
    :label="props.label"
    :invalid-text="props.invalidText"
    :disabled="props.disabled"
    :helper-text="props.helperText"
    :readonly="props.readonly"
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
      BCMSPasswordInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSPasswordInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      :readonly="args.readonly"
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
      BCMSPasswordInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSPasswordInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      :readonly="args.readonly"
      @input="args.value = $event"
    />
    `,
  }),
};
