import { defineComponent } from 'vue';
import { BCMSDateInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: {
      type: Number,
      required: true,
    },
    label: String,
    invalidText: String,
    disabled: Boolean,
    includeTime: Boolean,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <BCMSDateInput
          class={props.class}
          value={props.value}
          label={props.label}
          invalid-text={props.invalidText}
          disabled={props.disabled}
          include-time={props.includeTime}
          helper-text={props.helperText}
          onInput={action('input')}
        />
      );
    };
  },
});

export default component;
