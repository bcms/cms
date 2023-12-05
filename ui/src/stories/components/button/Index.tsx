import { defineComponent, type PropType } from 'vue';
import { BCMSButton } from '../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    kind: {
      type: String as PropType<
        'primary' | 'secondary' | 'alternate' | 'ghost' | 'danger'
      >,
      default: 'primary',
    },
    class: String,
    style: String,
    disabled: Boolean,
    size: String as PropType<'s' | 'm'>,
    href: String,
    newTab: Boolean,
    slot: String,
  },
  setup(props, ctx) {
    return () => {
      return (
        <BCMSButton
          kind={props.kind}
          class={props.class}
          style={props.style}
          disabled={props.disabled}
          size={props.size}
          href={props.href}
          new-tab={props.newTab}
          onClick={action('click')}
        >
          {ctx.slots.default?.()}
        </BCMSButton>
      );
    };
  },
});

export default component;
