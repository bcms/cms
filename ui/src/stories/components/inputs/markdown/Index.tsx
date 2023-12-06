import { PropType, defineComponent } from 'vue';
import { BCMSMarkdownInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    value: String,
    class: String,
    placeholder: String,
    label: String,
    invalidText: String,
    helperText: String,
    disabled: Boolean,
    minHeight: Number,
    additionalHelperSlot: Object as PropType<JSX.Element | string | undefined>,
  },
  setup(props) {
    return () => {
      return (
        <BCMSMarkdownInput
          class={props.class}
          value={props.value}
          placeholder={props.placeholder}
          label={props.label}
          invalid-text={props.invalidText}
          helper-text={props.helperText}
          disabled={props.disabled}
          minHeight={props.minHeight}
          onInput={action('input')}
        />
      );
    };
  },
});

export default component;
