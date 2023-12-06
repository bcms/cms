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
        <div className="flex items-end flex-wrap gap-10">
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
          <BCMSPasswordInput label="Label" />
          <BCMSPasswordInput
            placeholder="Placeholder"
            label="With placeholder"
          />
          <BCMSPasswordInput label="With error" invalid-text="Error text" />
          <BCMSPasswordInput label="Disabled" disabled />
          <BCMSPasswordInput label="With help" helper-text="Helper text" />
          <BCMSPasswordInput label="Read only" readonly />
        </div>
      );
    };
  },
});

export default component;
