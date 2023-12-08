import { PropType, defineComponent } from 'vue';
import { BCMSRadioInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { BCMSRadioInputOption } from '../../../../types';

const component = defineComponent({
  props: {
    class: String,
    options: Array as PropType<Array<BCMSRadioInputOption>>,
    modelValue: String,
    label: String,
    name: String,
    disabled: Boolean,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <BCMSRadioInput
          class={props.class}
          model-value={props.modelValue}
          options={props.options}
          label={props.label}
          name={props.name}
          disabled={props.disabled}
          helper-text={props.helperText}
          onUpdate:modelValue={action('input')}
        />
      );
    };
  },
});

export default component;
