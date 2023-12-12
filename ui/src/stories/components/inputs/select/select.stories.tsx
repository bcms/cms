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
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSSelectPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSSelectPreview
        :class="args.class"
        :label="args.label"
        :placeholder="args.placeholder"
        :invalid-text="args.invalidText"
        :helper-text="args.helperText"
        :disabled="args.disabled"
        :selected="args.selected"
        :options="args.options"
        @change="args.selected = $event.value"
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
    },
    label: {
      control: 'text',
    },
    placeholder: {
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
    selected: {
      control: 'text',
    },
    options: {
      control: 'object',
    },
    showSearch: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BCMSSelect>;

export const Playground: Story = {
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
        args,
      };
    },
    template: `
    <BCMSSelect
      :class="args.class"
      :label="args.label"
      :placeholder="args.placeholder"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      :disabled="args.disabled"
      selected="option1"
      :options="args.options"
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
        args,
      };
    },
    template: `
    <BCMSSelect
      :class="args.class"
      :label="args.label"
      :placeholder="args.placeholder"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      :disabled="args.disabled"
      :options="args.options"
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
        args,
      };
    },
    template: `
    <BCMSSelect
      :class="args.class"
      :label="args.label"
      :placeholder="args.placeholder"
      :invalid-text="args.invalidText"
      :helper-text="args.helperText"
      disabled
      :selected="args.selected"
      :options="args.options"
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
        args,
      };
    },
    template: `
    <BCMSSelect
      :class="args.class"
      :label="args.label"
      :placeholder="args.placeholder"
      invalid-text="Error text"
      :helper-text="args.helperText"
      :disabled="args.disabled"
      :selected="args.selected"
      :options="args.options"
    />
    `,
  }),
};
