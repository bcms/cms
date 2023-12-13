import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSCheckboxInputPreview from './Preview.tsx';
import BCMSCheckboxInput from './Index.tsx';

const meta: Meta<typeof BCMSCheckboxInput> = {
  title: 'Components/Inputs/Checkbox',
  component: BCMSCheckboxInput,
  render: (args) => ({
    components: {
      BCMSCheckboxInputPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSCheckboxInputPreview
        :class="props.class"
        :value="props.value"
        :label="props.label"
        :invalid-text="props.invalidText"
        :disabled="props.disabled"
        :helper-text="props.helperText"
        :description="props.description"
        @input="props.value = !props.value"
      />
    `,
  }),
  argTypes: {
    value: {
      control: 'boolean',
      description: 'true/false',
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Checkbox label',
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
    description: {
      control: 'text',
      description: 'Description text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSCheckboxInput>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSCheckboxInput
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
  <BCMSCheckboxInput
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

export const Checked: Story = {
  args: {
    label: 'Checked',
  },
  argTypes: {
    value: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSCheckboxInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="props.class"
      value
      :label="props.label"
      :invalid-text="props.invalidText"
      :disabled="props.disabled"
      :helper-text="props.helperText"
      :description="props.description"
    />
    `,
  }),
};

export const Unchecked: Story = {
  args: {
    label: 'Unchecked',
  },
  argTypes: {
    value: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSCheckboxInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="props.class"
      :value="false"
      :label="props.label"
      :invalid-text="props.invalidText"
      :disabled="props.disabled"
      :helper-text="props.helperText"
      :description="props.description"
    />
    `,
  }),
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
      BCMSCheckboxInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="props.class"
      :value="props.value"
      :label="props.label"
      :invalid-text="props.invalidText"
      disabled
      :helper-text="props.helperText"
      :description="props.description"
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
      BCMSCheckboxInput,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSCheckboxInput
      :class="props.class"
      :value="props.value"
      :label="props.label"
      :invalid-text="props.invalidText"
      :disabled="props.disabled"
      :helper-text="props.helperText"
      :description="props.description"
      @input="props.value = !props.value"
    />
    `,
  }),
};
