import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSButtonPreview from './Preview.tsx';
import BCMSButton from './Index.tsx';
import BCMSIcon from '../../../components/icon.tsx';

const meta: Meta<typeof BCMSButtonPreview> = {
  title: 'Components/Button',
  component: BCMSButtonPreview,
  render: (args) => ({
    components: {
      BCMSButtonPreview,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
      <BCMSButtonPreview
        :kind="props.kind"
        :class="props.class"
        :style="props.style"
        :disabled="props.disabled"
        :size="props.size"
        :href="props.href"
        :new-tab="props.newTab"
      >
        {{ props.slot }}
      </BCMSButtonPreview>
    `,
  }),
  argTypes: {
    kind: {
      control: 'select',
      options: ['primary', 'secondary', 'alternate', 'ghost', 'danger'],
      description: 'Button kind',
      table: {
        defaultValue: {
          summary: 'primary',
        },
      },
    },
    class: {
      control: 'text',
      description: 'TailwindCSS or custom CSS classes',
    },
    style: {
      control: 'text',
      description: 'Custom inline CSS style',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
    size: {
      control: 'select',
      options: ['s', 'm'],
      description: 'Button size',
    },
    href: {
      control: 'text',
      description: 'Make button a link',
    },
    newTab: {
      control: 'boolean',
      description: 'Open link in new tab',
    },
    slot: {
      control: 'text',
      description: 'Text or HTML',
      name: 'default slot',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BCMSButtonPreview>;

export const Preview: Story = {
  args: {
    slot: 'Button',
  },
  parameters: {
    docs: {
      source: {
        code: `
\`.jsx|.tsx\`
<BCMSButton
  kind={props.kind}
  class={props.class}
  style={props.style}
  disabled={props.disabled}
  size={props.size}
  href={props.href}
  new-tab={props.newTab}
  onClick={() => {}}
>
  Button
</BCMSButton>

\`.vue\`
<template>
  <BCMSButton
    :kind="props.kind"
    :class="props.class"
    :style="props.style"
    :disabled="props.disabled"
    :size="props.size"
    :href="props.href"
    :new-tab="props.newTab"
    @click="() => {}"
  >
    Button
  </BCMSButton>
</template>
        `,
      },
    },
  },
};

export const Primary: Story = {
  args: {
    slot: 'Primary',
  },
  argTypes: {
    kind: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSButton
      :class="props.class"
      :style="props.style"
      :disabled="props.disabled"
      :size="props.size"
      :href="props.href"
      :new-tab="props.newTab"
    >
      {{ props.slot }}
    </BCMSButton>
    `,
  }),
};

export const Secondary: Story = {
  args: {
    slot: 'Secondary',
  },
  argTypes: {
    kind: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSButton
      kind="secondary"
      :class="props.class"
      :style="props.style"
      :disabled="props.disabled"
      :size="props.size"
      :href="props.href"
      :new-tab="props.newTab"
    >
      {{ props.slot }}
    </BCMSButton>
    `,
  }),
};

export const Alternate: Story = {
  args: {
    slot: 'Alternate',
  },
  argTypes: {
    kind: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSButton
      kind="alternate"
      :class="props.class"
      :style="props.style"
      :disabled="props.disabled"
      :size="props.size"
      :href="props.href"
      :new-tab="props.newTab"
    >
      {{ props.slot }}
    </BCMSButton>
    `,
  }),
};

export const Ghost: Story = {
  args: {
    slot: 'Ghost',
  },
  argTypes: {
    kind: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSButton
      kind="ghost"
      :class="props.class"
      :style="props.style"
      :disabled="props.disabled"
      :size="props.size"
      :href="props.href"
      :new-tab="props.newTab"
    >
      {{ props.slot }}
    </BCMSButton>
    `,
  }),
};

export const Danger: Story = {
  args: {
    slot: 'Danger',
  },
  argTypes: {
    kind: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSButton
      kind="danger"
      :class="props.class"
      :style="props.style"
      :disabled="props.disabled"
      :size="props.size"
      :href="props.href"
      :new-tab="props.newTab"
    >
      {{ props.slot }}
    </BCMSButton>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    slot: 'Disabled',
  },
  argTypes: {
    disabled: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <div class="flex items-center gap-2">
      <BCMSButton
        :kind="props.kind"
        :class="props.class"
        :style="props.style"
        disabled
        :size="props.size"
        :href="props.href"
        :new-tab="props.newTab"
      >
        {{ props.slot }}
      </BCMSButton>
    </div>
    `,
  }),
};

export const Link: Story = {
  args: {
    slot: 'Link',
  },
  argTypes: {
    href: {
      control: false,
    },
  },
  render: (args) => ({
    components: {
      BCMSButton,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <BCMSButton
      :kind="props.kind"
      :class="props.class"
      :style="props.style"
      :disabled="props.disabled"
      :size="props.size"
      href="https://thebcms.com/"
      :new-tab="props.newTab"
    >
      {{ props.slot }}
    </BCMSButton>
    `,
  }),
};

export const WithIcon: Story = {
  args: {
    slot: 'With Icon',
  },
  render: (args) => ({
    components: {
      BCMSButton,
      BCMSIcon,
    },
    setup() {
      return {
        props: args,
      };
    },
    template: `
    <div class="flex items-center gap-2">
      <BCMSButton
        :kind="props.kind"
        :class="props.class"
        :style="props.style"
        :disabled="props.disabled"
        :size="props.size"
        :href="props.href"
        :new-tab="props.newTab"
      >
        <span class="flex items-center gap-2">
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
          <span>
            {{ props.slot }}
          </span>
        </span>
      </BCMSButton>
      <BCMSButton
        :kind="props.kind"
        :class="props.class"
        :style="props.style"
        :disabled="props.disabled"
        :size="props.size"
        :href="props.href"
        :new-tab="props.newTab"
      >
        <span class="flex items-center gap-2">
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
          <span>
            {{ props.slot }}
          </span>
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
        </span>
      </BCMSButton>
      <BCMSButton
        :kind="props.kind"
        :class="props.class"
        :style="props.style"
        :disabled="props.disabled"
        :size="props.size"
        :href="props.href"
        :new-tab="props.newTab"
      >
        <span class="flex items-center gap-2">
          <span>
            {{ props.slot }}
          </span>
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
        </span>
      </BCMSButton:kind=>
    </div>
    `,
  }),
};
