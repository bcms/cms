import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSMarkdownInputPreview from './Preview.jsx';
import BCMSMarkdownInput from './Index.jsx';

const meta: Meta<typeof BCMSMarkdownInput> = {
  title: 'Components/Inputs/Markdown',
  component: BCMSMarkdownInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSMarkdownInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSMarkdownInputPreview
        :class="args.class"
        :value="args.value"
        :placeholder="args.placeholder"
        :label="args.label"
        :invalid-text="args.invalidText"
        :helper-text="args.helperText"
        :disabled="args.disabled"
        :min-height="args.minHeight"
        :additional-helper-slot="args.additionalHelperSlot"
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
    helperText: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    minHeight: {
      control: 'number',
    },
    additionalHelperSlot: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSMarkdownInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSMarkdownInput
  class={props.class}
  value={props.value}
  placeholder={props.placeholder}
  label={props.label}
  invalid-text={props.invalidText}
  helper-text={props.helperText}
  disabled={props.disabled}
  min-height={props.minHeight}
  additional-helper-slot={props.additionalHelperSlot}
  onInput={(val) => props.value = val}
/>

\`.vue\`
<template>
  <BCMSMarkdownInput
    :class="props.class"
    :value="props.value"
    :placeholder="props.placeholder"
    :label="props.label"
    :invalid-text="props.invalidText"
    :helper-text="props.helperText"
    :disabled="props.disabled"
    :min-height="props.minHeight"
    :additional-helper-slot="props.additionalHelperSlot"
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
      BCMSMarkdownInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSMarkdownInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      :disabled="args.disabled"
      :min-height="args.minHeight"
      :additional-helper-slot="args.additionalHelperSlot"
      @input="($event) => args.value = $event.value"
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
      BCMSMarkdownInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSMarkdownInput
      :class="args.class"
      :value="args.value"
      :placeholder="args.placeholder"
      :label="args.label"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      :disabled="args.disabled"
      :min-height="args.minHeight"
      :additional-helper-slot="args.additionalHelperSlot"
      @input="($event) => args.value = $event.value"
    />
    `,
  }),
};
