import { defineComponent } from 'vue';
import { BCMSPasswordInput } from '../../../../components';
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
    readonly: Boolean,
  },
  setup(props) {
    return () => {
      return (
        <BCMSPasswordInput
          class={props.class}
          value={props.value}
          placeholder={props.placeholder}
          label={props.label}
          invalid-text={props.invalidText}
          disabled={props.disabled}
          helper-text={props.helperText}
          readonly={props.readonly}
          onInput={action('input')}
          onEnter={action('enter')}
        />
      );
    };
  },
});

export default component;
