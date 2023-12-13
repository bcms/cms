import { defineComponent, type PropType } from 'vue';
import { BCMSOverflowMenuItem } from '../../../components';
import React from 'react';
import { action } from '@storybook/addon-actions';

const component = defineComponent({
  props: {
    class: String,
    text: {
      type: String,
      required: true,
    },
    description: String,
    theme: {
      type: String as PropType<'default' | 'danger'>,
      default: 'default',
    },
    icon: String,
  },
  setup(props) {
    return () => {
      return (
        <div className="flex flex-col gap-4 mb-5">
          <BCMSOverflowMenuItem
            text={props.text}
            icon="edit"
            description={props.description}
            theme={props.theme}
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
        </div>
      );
    };
  },
});

export default component;
