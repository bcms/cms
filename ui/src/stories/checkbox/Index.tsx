import { defineComponent } from 'vue';
import { BCMSCheckboxInput } from '../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: Boolean,
    label: String,
    invalidText: String,
    disabled: Boolean,
    helperText: String,
    description: String,
  },
  setup(props) {
    return () => {
      return (
        <BCMSCheckboxInput
          class={props.class}
          value={props.value}
          label={props.label}
          invalid-text={props.invalidText}
          disabled={props.disabled}
          helper-text={props.helperText}
          description={props.description}
          onInput={action('input')}
        />
      );
    };
  },
});

export default component;
