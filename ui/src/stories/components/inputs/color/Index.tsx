import { defineComponent } from 'vue';
import { BCMSColorPickerInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: {
      type: String,
      required: true,
    },
    label: String,
    invalidText: String,
    helperText: String,
    allowCustom: Boolean,
    allowGlobal: Boolean,
    allowCreateColor: Boolean,
  },
  setup(props) {
    return () => {
      return (
        <BCMSColorPickerInput
          class={`max-w-max ${props.class}`}
          value={props.value}
          label={props.label}
          invalid-text={props.invalidText}
          helper-text={props.helperText}
          allow-custom={props.allowCustom}
          allow-global={props.allowGlobal}
          allow-custom-force
          allow-create-color={props.allowCreateColor}
          onChange={action('change')}
        />
      );
    };
  },
});

export default component;
