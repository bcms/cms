import { PropType, defineComponent } from 'vue';
import { BCMSTextAreaInput } from '../../../../components';
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
    // minHeight: {
    //   type: Number,
    //   default: 44,
    // },
    format: Function as PropType<(value: string) => string>,
  },
  setup(props) {
    return () => {
      return (
        <BCMSTextAreaInput
          class={props.class}
          value={props.value}
          placeholder={props.placeholder}
          label={props.label}
          invalid-text={props.invalidText}
          disabled={props.disabled}
          helper-text={props.helperText}
          // min-height={props.minHeight}
          onInput={action('input')}
        />
      );
    };
  },
});

export default component;
