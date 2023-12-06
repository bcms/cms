import { defineComponent } from 'vue';
import { BCMSNumberInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    value: Number,
    class: String,
    placeholder: String,
    label: String,
    invalidText: String,
    disabled: Boolean,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <BCMSNumberInput
          class={props.class}
          value={props.value}
          placeholder={props.placeholder}
          label={props.label}
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
