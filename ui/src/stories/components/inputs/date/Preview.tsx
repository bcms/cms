import { defineComponent } from 'vue';
import { BCMSDateInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: {
      type: Number,
      required: true,
    },
    label: String,
    invalidText: String,
    disabled: Boolean,
    includeTime: Boolean,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <div className="flex items-end flex-wrap gap-10">
          <BCMSDateInput
            class={props.class}
            value={props.value}
            label={props.label}
            invalid-text={props.invalidText}
            disabled={props.disabled}
            include-time={props.includeTime}
            helper-text={props.helperText}
            onInput={action('input')}
          />
          <BCMSDateInput value={new Date().getTime()} label="Label" />
          <BCMSDateInput
            value={new Date().getTime()}
            label="With error"
            invalid-text="Error text"
          />
          <BCMSDateInput
            value={new Date().getTime()}
            label="Help"
            helper-text="Help text"
          />
          <BCMSDateInput
            value={new Date().getTime()}
            label="Disabled"
            disabled
          />
        </div>
      );
    };
  },
});

export default component;
