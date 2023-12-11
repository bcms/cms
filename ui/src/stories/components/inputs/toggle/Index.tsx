import { PropType, defineComponent } from 'vue';
import { BCMSToggleInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: Boolean,
    label: String,
    disabled: Boolean,
    states: Object as PropType<[string, string]>,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <BCMSToggleInput
          class={props.class}
          value={props.value}
          label={props.label}
          disabled={props.disabled}
          states={props.states}
          helper-text={props.helperText}
          onInput={action('input')}
        />
      );
    };
  },
});

export default component;
