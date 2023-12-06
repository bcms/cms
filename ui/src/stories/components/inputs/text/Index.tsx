import { PropType, defineComponent } from 'vue';
import { BCMSTextInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    value: Number,
    class: String,
    placeholder: String,
    label: String,
    type: {
      type: String as PropType<'text' | 'email'>,
      default: 'text',
    },
    invalidText: String,
    disabled: Boolean,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <BCMSTextInput
          class={props.class}
          value={props.value}
          placeholder={props.placeholder}
          label={props.label}
          type={props.type}
          invalid-text={props.invalidText}
          disabled={props.disabled}
          helper-text={props.helperText}
          onInput={action('input')}
          onEnter={action('enter')}
        />
      );
    };
  },
});

export default component;
