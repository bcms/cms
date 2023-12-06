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
        <div className="flex items-end flex-wrap gap-10">
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
          <BCMSNumberInput label="Label" />
          <BCMSNumberInput placeholder="Placeholder" label="With placeholder" />
          <BCMSNumberInput label="With error" invalid-text="Error text" />
          <BCMSNumberInput label="Disabled" disabled />
          <BCMSNumberInput label="With help" helper-text="Helper text" />
        </div>
      );
    };
  },
});

export default component;
