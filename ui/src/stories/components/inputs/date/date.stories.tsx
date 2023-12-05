import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSDateInputPreview from './Preview.tsx';
import BCMSDateInput from './Index.tsx';

const meta: Meta<typeof BCMSDateInput> = {
  title: 'Components/Inputs/Date',
  component: BCMSDateInput,
  // tags: ['autodocs'],
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
    },
    class: {
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
    includeTime: {
      control: false,
    },
    helperText: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSDateInput>;

export const Playground: Story = {
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
