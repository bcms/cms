import { PropType, defineComponent } from 'vue';
import { BCMSMultiAddInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    label: String,
    value: {
      type: Array as PropType<string[]>,
      required: true,
      default: () => [],
    },
    placeholder: String,
    invalidText: String,
    helperText: String,
    disabled: Boolean,
    format: Function as PropType<(value: string) => string>,
    validate: Function as PropType<(value: string[]) => string | null>,
  },
  setup(props) {
    return () => {
      return (
        <BCMSMultiAddInput
          class={props.class}
          label={props.label}
          value={props.value}
          placeholder={props.placeholder}
          invalid-text={props.invalidText}
          helper-text={props.helperText}
          disabled={props.disabled}
          format={props.format}
          validate={props.validate}
          onInput={action('input')}
        />
      );
    };
  },
});

export default component;
