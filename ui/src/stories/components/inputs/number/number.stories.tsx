import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSNumberInputPreview from './Preview.tsx';
import BCMSNumberInput from './Index.tsx';

const meta: Meta<typeof BCMSNumberInput> = {
  title: 'Components/Inputs/Number',
  component: BCMSNumberInput,
  render: (args) => ({
    components: {
      BCMSNumberInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSNumberInputPreview
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
      control: 'number',
      description: 'Number',
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
      description: 'Number label',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable checkbox interaction',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSNumberInput>;

export const Preview: Story = {
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
        props: args,
      };
    },
    template: `
    <BCMSNumberInput
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
      BCMSNumberInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
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
    `,
  }),
};
