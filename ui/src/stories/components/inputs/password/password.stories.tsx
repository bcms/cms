import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSPasswordInputPreview from './Preview.tsx';
import BCMSPasswordInput from './Index.tsx';

const meta: Meta<typeof BCMSPasswordInput> = {
  title: 'Components/Inputs/Password',
  component: BCMSPasswordInput,
  render: (args) => ({
    components: {
      BCMSPasswordInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSPasswordInputPreview
        :class="props.class"
        :value="props.value"
        :placeholder="props.placeholder"
        :label="props.label"
        :invalid-text="props.invalidText"
        :disabled="props.disabled"
        :helper-text="props.helperText"
        :readonly="props.readonly"
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
      description: 'Password label',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable password interaction',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
    readonly: {
      control: 'boolean',
      description: 'Prevent text change',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSPasswordInput>;

export const Preview: Story = {
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
        props: args,
      };
    },
    template: `
    <BCMSPasswordInput
      :class="props.class"
      :value="props.value"
      :placeholder="props.placeholder"
      :label="props.label"
      :invalid-text="props.invalidText"
      disabled
      :helper-text="props.helperText"
      :readonly="props.readonly"
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
      BCMSPasswordInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
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
    `,
  }),
};
