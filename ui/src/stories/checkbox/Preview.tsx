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
        <div className="flex items-end flex-wrap justify-between gap-10 p-8">
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
          <BCMSCheckboxInput value />
          <BCMSCheckboxInput value label="Label" />
          <BCMSCheckboxInput
            value
            label="With error"
            invalid-text="Error text"
          />
          <BCMSCheckboxInput label="Disabled" disabled />
          <BCMSCheckboxInput
            value
            label="With help"
            helper-text="Helper text"
          />
          <BCMSCheckboxInput
            value
            label="With description"
            description="Description text"
          />
        </div>
      );
    };
  },
});

export default component;
