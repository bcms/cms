import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSRadioInputPreview from './Preview.tsx';
import BCMSRadioInput from './Index.tsx';

const options = [
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
];

const meta: Meta<typeof BCMSRadioInput> = {
  title: 'Components/Inputs/Radio',
  component: BCMSRadioInput,
  render: (args) => ({
    components: {
      BCMSRadioInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSRadioInputPreview
      :class="props.class"
      :modelValue="props.modelValue"
      :options="props.options"
      :label="props.label"
      :name="props.name"
      :disabled="props.disabled"
      :helper-text="props.helperText"
      @input="props.modelValue = $event.target.value"
    />
    `,
  }),
  args: {
    modelValue: 'option1',
    options,
    name: 'options',
  },
  argTypes: {
    modelValue: {
      control: 'text',
      description: 'Text value of an option',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Radio label',
    },
    name: {
      control: 'text',
      description: 'Name of the radio group',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable radio interaction',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
    options: {
      control: 'object',
      description: 'Array of options',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSRadioInput>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSRadioInput
  class={props.class}
  modelValue={props.modelValue}
  options={props.options}
  label={props.label}
  disabled={props.disabled}
  helper-text={props.helperText}
  onInput={(val) => props.modelValue = val}
/>

\`.vue\`
<template>
  <BCMSRadioInput
    :class="props.class"
    :modelValue="props.modelValue"
    :options="props.options"
    :label="props.label"
    :disabled="props.disabled"
    :helper-text="props.helperText"
    @input="props.modelValue = $event"
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
    options,
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
        props: args,
      };
    },
    template: `
    <BCMSRadioInput
      :class="props.class"
      modelValue="option1"
      :options="props.options"
      :label="props.label"
      :disabled="props.disabled"
      :helper-text="props.helperText"
    />
    `,
  }),
};

export const Unselected: Story = {
  args: {
    label: 'Unselected',
    options,
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
        props: args,
      };
    },
    template: `
    <BCMSRadioInput
      :class="props.class"
      modelValue=""
      :options="props.options"
      :label="props.label"
      :disabled="props.disabled"
      :helper-text="props.helperText"
    />
    `,
  }),
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    options,
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
        props: args,
      };
    },
    template: `
    <BCMSRadioInput
      :class="props.class"
      disabled
      :modelValue="props.modelValue"
      :options="props.options"
      :label="props.label"
      disabled
      :helper-text="props.helperText"
    />
    `,
  }),
};
