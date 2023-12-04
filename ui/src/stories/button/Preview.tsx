import { defineComponent, type PropType } from 'vue';
import { BCMSButton } from '../../components';
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
        <div className="flex items-center flex-wrap gap-4 mb-5">
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
          <BCMSButton kind="secondary"> Secondary </BCMSButton>
          <BCMSButton kind="alternate"> Alternate </BCMSButton>
          <BCMSButton kind="ghost"> Ghost </BCMSButton>
          <BCMSButton kind="danger"> Danger </BCMSButton>
          <BCMSButton disabled> Disabled </BCMSButton>
          <BCMSButton size="s"> Small </BCMSButton>
          <BCMSButton href="https://thebcms.com/" newTab class="text-center">
            Link
          </BCMSButton>
        </div>
      );
    };
  },
});

export default component;
