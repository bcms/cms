import { defineComponent } from 'vue';
import { BCMSColorPickerInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: {
      type: String,
      required: true,
    },
    label: String,
    invalidText: String,
    helperText: String,
    allowCustom: Boolean,
    allowGlobal: Boolean,
    allowCreateColor: Boolean,
  },
  setup(props) {
    return () => {
      return (
        <div className="flex flex-wrap gap-10">
          <BCMSColorPickerInput
            class={`max-w-max ${props.class}`}
            value={props.value}
            label={props.label}
            invalid-text={props.invalidText}
            helper-text={props.helperText}
            allow-custom={props.allowCustom}
            allow-global={props.allowGlobal}
            allow-custom-force
            allow-create-color={props.allowCreateColor}
            onChange={action('change')}
          />
          <BCMSColorPickerInput
            class="max-w-max"
            value="#249681"
            label="Label"
            allow-custom
            allow-global
            allow-custom-force
            allow-create-color
          />
          <BCMSColorPickerInput
            class="max-w-max"
            value="#249681"
            label="With error"
            invalid-text="Error text"
            allow-custom
            allow-global
            allow-custom-force
            allow-create-color
          />
          <BCMSColorPickerInput
            class="max-w-max"
            value="#249681"
            label="With help"
            helper-text="Helper text"
            allow-custom
            allow-global
            allow-custom-force
            allow-create-color
          />
        </div>
      );
    };
  },
});

export default component;
