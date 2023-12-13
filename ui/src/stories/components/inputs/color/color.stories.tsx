import type { Meta, StoryObj } from '@storybook/vue3';
import 'vue3-colorpicker/style.css';

import BCMSColorPickerInputPreview from './Preview.tsx';
import BCMSColorPickerInput from './Index.tsx';

const meta: Meta<typeof BCMSColorPickerInput> = {
  title: 'Components/Inputs/Color Picker',
  component: BCMSColorPickerInput,
  render: (args) => ({
    components: {
      BCMSColorPickerInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSColorPickerInputPreview
        :class="props.class"
        :value="props.value"
        :label="props.label"
        :invalid-text="props.invalidText"
        :helper-text="props.helperText"
        :allow-custom="props.allowCustom"
        :allow-global="props.allowGlobal"
        :allow-create-color="props.allowCreateColor"
        @change="props.value = $event"
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
      description: 'Hex color',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Color label',
    },
    invalidText: {
      control: 'text',
      description: 'Error text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text',
    },
    allowCustom: {
      control: 'boolean',
      description: 'Select a custom color',
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

export const Preview: Story = {
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
        props: args,
      };
    },
    template: `
    <BCMSColorPickerInput
      :class="props.class"
      :value="props.value"
      :label="props.label"
      :invalid-text="props.invalidText"
      :helper-text="props.helperText"
      :allow-custom="props.allowCustom"
      :allow-global="props.allowGlobal"
      :allow-create-color="props.allowCreateColor"
      @change="props.value = $event"
    />
    `,
  }),
};
