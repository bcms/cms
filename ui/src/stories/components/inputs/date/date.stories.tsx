import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSDateInputPreview from './Preview.tsx';
import BCMSDateInput from './Index.tsx';

const meta: Meta<typeof BCMSDateInput> = {
  title: 'Components/Inputs/Date',
  component: BCMSDateInput,
  render: (args) => ({
    components: {
      BCMSDateInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSDateInputPreview
        :class="args.class"
        :value="args.value"
        :label="args.label"
        :invalid-text="args.invalidText"
        :disabled="args.disabled"
        :include-time="args.includeTime"
        :helper-text="args.helperText"
        @input="args.value = $event"
      />
    `,
  }),
  args: {
    value: new Date().getTime(),
  },
  argTypes: {
    value: {
      control: 'number',
      description: 'Timestamp',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Date label',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable date interaction',
    },
    includeTime: {
      control: false,
      description: 'Include time input',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSDateInput>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSDateInput
  class={props.class}
  value={props.value}
  label={props.label}
  invalid-text={props.invalidText}
  disabled={props.disabled}
  include-time={props.includeTime}
  helper-text={props.helperText}
  onInput={(val) => props.value = val}
/>

\`.vue\`
<template>
  <BCMSDateInput
    :class="props.class"
    :value="props.value"
    :label="props.label"
    :invalid-text="props.invalidText"
    :disabled="props.disabled"
    :include-time="props.includeTime"
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
      BCMSDateInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSDateInput
      :class="args.class"
      :value="args.value"
      :label="args.label"
      :invalid-text="args.invalidText"
      disabled
      :include-time="args.includeTime"
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
      BCMSDateInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSDateInput
      :class="args.class"
      :value="args.value"
      :label="args.label"
      :invalid-text="args.invalidText"
      :disabled="args.disabled"
      :include-time="args.includeTime"
      :helper-text="args.helperText"
      @input="args.value = $event"
    />
    `,
  }),
};
