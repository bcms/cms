import type { Meta, StoryObj } from '@storybook/vue3';
import 'vue3-colorpicker/style.css';

import BCMSColorPickerInputPreview from './Preview.tsx';
import BCMSColorPickerInput from './Index.jsx';

const meta: Meta<typeof BCMSColorPickerInput> = {
  title: 'Components/Inputs/Color Picker',
  component: BCMSColorPickerInput,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSColorPickerInputPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSColorPickerInputPreview
        :class="args.class"
        :value="args.value"
        :label="args.label"
        :invalid-text="args.invalidText"
        :helper-text="args.helperText"
        :allow-custom="args.allowCustom"
        :allow-global="args.allowGlobal"
        :allow-create-color="args.allowCreateColor"
        @change="args.value = $event"
      />
    `,
  }),
  args: {
    value: '',
    class: undefined,
    label: undefined,
    invalidText: undefined,
    helperText: undefined,
    allowGlobal: true,
    allowCustom: true,
    allowCreateColor: true,
  },
  argTypes: {
    value: {
      control: 'text',
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
    helperText: {
      control: 'text',
    },
    allowCustom: {
      control: 'boolean',
    },
    allowGlobal: {
      control: 'boolean',
      defaultValue: true,
    },
    allowCreateColor: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSColorPickerInput>;

export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSColorPickerInput
  class={props.class}
  value={props.value}
  label={props.label}
  invalid-text={props.invalidText}
  disabled={props.disabled}
  helper-text={props.helperText}
  description={props.description}
  onInput={() => props.value = !props.value}
/>

\`.vue\`
<template>
  <BCMSColorPickerInput
    :class="props.class"
    :value="props.value"
    :label="props.label"
    :invalid-text="props.invalidText"
    :disabled="props.disabled"
    :helper-text="props.helperText"
    :description="props.description"
    @input="props.value = !props.value"
  />
</template>
        `,
      },
    },
  },
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
      BCMSColorPickerInput,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <BCMSColorPickerInput
      :class="args.class"
      :value="args.value"
      :label="args.label"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      :allow-custom="args.allowCustom"
      :allow-global="args.allowGlobal"
      :allow-create-color="args.allowCreateColor"
      @change="args.value = $event"
    />
    `,
  }),
};
