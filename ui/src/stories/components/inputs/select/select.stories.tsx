import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSSelectPreview from './Preview.tsx';
import BCMSSelect from './Index.tsx';

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

const meta: Meta<typeof BCMSSelect> = {
  title: 'Components/Inputs/Select',
  component: BCMSSelect,
  render: (args) => ({
    components: {
      BCMSSelectPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSSelectPreview
        :class="props.class"
        :label="props.label"
        :placeholder="props.placeholder"
        :invalid-text="props.invalidText"
        :helper-text="props.helperText"
        :disabled="props.disabled"
        :selected="props.selected"
        :options="props.options"
        @change="props.selected = $event.value"
      />
    `,
  }),
  decorators: [
    () => ({
      template: `
      <div>
        <story />
        <div id="bcmsSelectList" />
      </div>`,
    }),
  ],
  args: {
    options,
  },
  argTypes: {
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    label: {
      control: 'text',
      description: 'Select label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
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
      description: 'Disable select interaction',
    },
    selected: {
      control: 'text',
      description: 'Selected option value',
    },
    options: {
      control: 'object',
      description: 'Select options',
      table: {
        defaultValue: {
          summary: '[]',
        },
      },
    },
    showSearch: {
      control: 'boolean',
      description: 'Show search input',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSSelect>;

export const Preview: Story = {
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSSelect
  class={props.class}
  label={props.label}
  placeholder={props.placeholder}
  invalid-text={props.invalidText}
  helper-text={props.helperText}
  disabled={props.disabled}
  selected={props.selected}
  options={props.options}
  onChange={(val) => props.selected = val.value}
/>

\`.vue\`
<template>
  <BCMSSelect
    :class="props.class"
    :label="props.label"
    :placeholder="props.placeholder"
    :invalid-text="props.invalidText"
    :helper-text="props.helperText"
    :disabled="props.disabled"
    :selected="props.selected"
    :options="props.options"
    @change="props.selected = $event.value"
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
    selected: {
      control: false,
    },
    options: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSSelect,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSSelect
      :class="props.class"
      :label="props.label"
      :placeholder="props.placeholder"
      :invalid-text="props.invalidText"
      :helper-text="props.helperText"
      :disabled="props.disabled"
      selected="option1"
      :options="props.options"
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
    selected: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSSelect,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSSelect
      :class="props.class"
      :label="props.label"
      :placeholder="props.placeholder"
      :invalid-text="props.invalidText"
      :helper-text="props.helperText"
      :disabled="props.disabled"
      :options="props.options"
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
      BCMSSelect,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSSelect
      :class="props.class"
      :label="props.label"
      :placeholder="props.placeholder"
      :invalid-text="props.invalidText"
      :helper-text="props.helperText"
      disabled
      :selected="props.selected"
      :options="props.options"
    />
    `,
  }),
};

export const Error: Story = {
  args: {
    options,
  },
  argTypes: {
    invalidText: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSSelect,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSSelect
      :class="props.class"
      :label="props.label"
      :placeholder="props.placeholder"
      invalid-text="Error text"
      :helper-text="props.helperText"
      :disabled="props.disabled"
      :selected="props.selected"
      :options="props.options"
    />
    `,
  }),
};
