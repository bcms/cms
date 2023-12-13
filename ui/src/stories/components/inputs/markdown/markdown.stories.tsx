import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSMarkdownInputPreview from './Preview.tsx';
import BCMSMarkdownInput from './Index.tsx';

const meta: Meta<typeof BCMSMarkdownInput> = {
  title: 'Components/Inputs/Markdown',
  component: BCMSMarkdownInput,
  render: (args) => ({
    components: {
      BCMSMarkdownInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSMarkdownInputPreview
        :class="props.class"
        :value="props.value"
        :placeholder="props.placeholder"
        :label="props.label"
        :invalid-text="props.invalidText"
        :helper-text="props.helperText"
        :disabled="props.disabled"
        :min-height="props.minHeight"
        :additional-helper-slot="props.additionalHelperSlot"
        @input="($event) => props.value = $event.value"
      />
    `,
  }),
  argTypes: {
    value: {
      control: 'text',
      description: 'Markdown text',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    placeholder: {
      control: 'text',
      description: 'Markdown placeholder',
    },
    label: {
      control: 'text',
      description: 'Markdown label',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable markdown interaction',
    },
    minHeight: {
      control: 'number',
      description: 'Minimum height',
    },
    additionalHelperSlot: {
      control: 'text',
      description: 'Additional helper text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSMarkdownInput>;

export const Preview: Story = {
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
        props: args,
      };
    },
    template: `
    <BCMSMarkdownInput
      :class="props.class"
      :value="props.value"
      :placeholder="props.placeholder"
      :label="props.label"
      :invalid-text="props.invalidText"
      :helper-text="props.helperText"
      disabled
      :min-height="props.minHeight"
      :additional-helper-slot="props.additionalHelperSlot"
      @input="($event) => props.value = $event.value"
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
        props: args,
      };
    },
    template: `
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
      @input="($event) => props.value = $event.value"
    />
    `,
  }),
};
