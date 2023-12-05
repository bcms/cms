import type { Meta, StoryObj } from '@storybook/vue3';

import BCMSButtonPreview from './Preview.tsx';
import BCMSButton from './Index.tsx';
import BCMSIcon from '../../../components/icon.tsx';

const meta: Meta<typeof BCMSButtonPreview> = {
  title: 'Components/Button',
  component: BCMSButtonPreview,
  // tags: ['autodocs'],
  render: (args) => ({
    components: {
      BCMSButtonPreview,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
      <BCMSButtonPreview :kind="args.kind" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
        {{ args.slot }}
      </BCMSButtonPreview>
    `,
  }),
  argTypes: {
    kind: {
      control: 'select',
      options: ['primary', 'secondary', 'alternate', 'ghost', 'danger'],
    },
    class: {
      control: 'text',
    },
    style: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    size: { control: 'select', options: ['s', 'm'] },
    href: {
      control: 'text',
    },
    newTab: {
      control: 'boolean',
    },
    slot: {
      control: 'text',
      description: 'Text or HTML',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BCMSButtonPreview>;

export const Playground: Story = {
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
  newTab={props.newTab}
  onClick={() => alert('Clicked!')}
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
    :newTab="props.newTab"
    @click="alert('Clicked!')"
  >
    Button
  </BCMSButton>
</template>
        `,
      },
    },
  },
  args: {
    kind: 'primary',
    slot: 'Button',
  },
};

export const Primary: Story = {
  args: {
    kind: 'primary',
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
        args,
      };
    },
    template: `
    <BCMSButton kind="primary" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
      {{ args.slot }}
    </BCMSButton>
    `,
  }),
};

export const Secondary: Story = {
  args: {
    kind: 'secondary',
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
        args,
      };
    },
    template: `
    <BCMSButton kind="secondary" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
      {{ args.slot }}
    </BCMSButton>
    `,
  }),
};

export const Alternate: Story = {
  args: {
    kind: 'alternate',
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
        args,
      };
    },
    template: `
    <BCMSButton kind="alternate" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
      {{ args.slot }}
    </BCMSButton>
    `,
  }),
};

export const Ghost: Story = {
  args: {
    kind: 'ghost',
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
        args,
      };
    },
    template: `
    <BCMSButton kind="ghost" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
      {{ args.slot }}
    </BCMSButton>
    `,
  }),
};

export const Danger: Story = {
  args: {
    kind: 'danger',
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
        args,
      };
    },
    template: `
    <BCMSButton kind="danger" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
      {{ args.slot }}
    </BCMSButton>
    `,
  }),
};

export const Disabled: Story = {
  args: {
    kind: 'primary',
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
        args,
      };
    },
    template: `
    <div class="flex items-center gap-2">
      <BCMSButton :kind="args.kind" :class="args.class" :style="args.style" disabled :size="args.size" :href="args.href" :new-tab="args.newTab">
        {{ args.slot }}
      </BCMSButton>
    </div>
    `,
  }),
};

export const Link: Story = {
  args: {
    kind: 'primary',
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
        args,
      };
    },
    template: `
    <BCMSButton :kind="args.kind" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" href="https://thebcms.com/" :new-tab="args.newTab">
      {{ args.slot }}
    </BCMSButton>
    `,
  }),
};

export const WithIcon: Story = {
  args: {
    kind: 'primary',
    slot: 'With Icon',
  },
  render: (args) => ({
    components: {
      BCMSButton,
      BCMSIcon,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <div class="flex items-center gap-2">
      <BCMSButton :kind="args.kind" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
        <span class="flex items-center gap-2">
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
          <span>
            {{ args.slot }}
          </span>
        </span>
      </BCMSButton>
      <BCMSButton :kind="args.kind" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
        <span class="flex items-center gap-2">
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
          <span>
          {{ args.slot }}
          </span>
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
        </span>
      </BCMSButton>
      <BCMSButton :kind="args.kind" :class="args.class" :style="args.style" :disabled="args.disabled" :size="args.size" :href="args.href" :new-tab="args.newTab">
        <span class="flex items-center gap-2">
          <span>
          {{ args.slot }}
          </span>
          <BCMSIcon src="/file" class="w-4 h-4 fill-current" />
        </span>
      </BCMSButton>
    </div>
    `,
  }),
};
