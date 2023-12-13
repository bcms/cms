import { defineComponent, type PropType } from 'vue';
import { BCMSOverflowMenu, BCMSOverflowMenuItem } from '../../../components';
import React from 'react';
import { action } from '@storybook/addon-actions';

const component = defineComponent({
  props: {
    class: String,
    position: {
      type: String as PropType<'left' | 'right'>,
      default: 'left',
    },
    optionsWidth: Number,
    orientation: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical',
    },
    title: String,
    slot: String,
  },
  setup(props, ctx) {
    return () => {
      return (
        <div className="flex items-center flex-wrap gap-4 mb-5">
          <BCMSOverflowMenu
            class={props.class}
            position={props.position}
            options-width={props.optionsWidth}
            orientation={props.orientation}
            title={props.title}
          >
            <BCMSOverflowMenuItem
              text="Edit"
              icon="edit"
              description="Edit description"
              onClick={action('click')}
            />
            <BCMSOverflowMenuItem
              text="Notifications"
              icon="bell"
              onClick={action('click')}
            />
            <BCMSOverflowMenuItem
              text="Remove"
              icon="trash"
              theme="danger"
              onClick={action('click')}
            />
            {ctx.slots.default ? ctx.slots.default() : ''}
          </BCMSOverflowMenu>
        </div>
      );
    };
  },
});

export default component;
