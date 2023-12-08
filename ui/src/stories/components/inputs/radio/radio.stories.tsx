import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSRadioInputPreview from './Preview.tsx';
import BCMSRadioInput from './Index.tsx';

const meta: Meta<typeof BCMSRadioInput> = {
  title: 'Components/Inputs/Radio',
  component: BCMSRadioInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSRadioInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSRadioInputPreview
      :class="args.class"
      :modelValue="args.modelValue"
      :options="args.options"
      :label="args.label"
      :name="args.name"
      :disabled="args.disabled"
      :helper-text="args.helperText"
      @input="args.modelValue = $event.target.value"
    />
    `,
  }),
  args: {
    modelValue: 'option1',
    options: [
      {
        label: 'Option 1',
        value: 'option1',
      },
      {
        label: 'Option 2',
        value: 'option2',
      },
      {
        label: 'Option 3',
        value: 'option3',
      },
    ],
    name: 'options',
  },
  argTypes: {
    modelValue: {
      control: 'text',
    },
    class: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    name: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    helperText: {
      control: 'text',
    },
    options: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSRadioInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSRadioInput
  class={props.class}
  value={props.value}
  label={props.label}
  disabled={props.disabled}
  helper-text={props.helperText}
  onInput={() => props.value = !props.value}
/>

\`.vue\`
<template>
  <BCMSRadioInput
    :class="props.class"
    :value="props.value"
    :label="props.label"
    :disabled="props.disabled"
    :helper-text="props.helperText"
    @input="props.value = !props.value"
  />
</template>
        `,
      },
    },
  },
};

export const Selected: Story = {
  args: {
    label: 'Selected',
  },
  argTypes: {
    modelValue: {
      control: false,
    },
    options: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSRadioInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSRadioInput
      :class="args.class"
      modelValue="option1"
      :options="[
        {
          label: 'Option 1',
          value: 'option1',
        },
        {
          label: 'Option 2',
          value: 'option2',
        },
        {
          label: 'Option 3',
          value: 'option3',
        },
      ]"
      :label="args.label"
      :disabled="args.disabled"
      :helper-text="args.helperText"
    />
    `,
  }),
};

export const Unselected: Story = {
  args: {
    label: 'Unselected',
  },
  argTypes: {
    modelValue: {
      control: false,
    },
    options: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSRadioInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSRadioInput
      :class="args.class"
      modelValue=""
      :options="[
        {
          label: 'Option 1',
          value: 'option1',
        },
        {
          label: 'Option 2',
          value: 'option2',
        },
        {
          label: 'Option 3',
          value: 'option3',
        },
      ]"
      :label="args.label"
      :disabled="args.disabled"
      :helper-text="args.helperText"
    />
    `,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    options: [
      {
        label: 'Option 1',
        value: 'option1',
      },
      {
        label: 'Option 2',
        value: 'option2',
      },
      {
        label: 'Option 3',
        value: 'option3',
      },
    ],
  },
  argTypes: {
    disabled: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSRadioInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSRadioInput
      :class="args.class"
      disabled
      :modelValue="args.modelValue"
      :options="args.options"
      :label="args.label"
      disabled
      :helper-text="args.helperText"
    />
    `,
  }),
};
