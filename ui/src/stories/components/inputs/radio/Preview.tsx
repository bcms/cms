import { PropType, defineComponent } from 'vue';
import { BCMSRadioInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { BCMSRadioInputOption } from '../../../../types';

const component = defineComponent({
  props: {
    class: String,
    options: Array as PropType<Array<BCMSRadioInputOption>>,
    modelValue: String,
    label: String,
    name: String,
    disabled: Boolean,
    helperText: String,
  },
  setup(props) {
    return () => {
      return (
        <div className="flex items-end flex-wrap gap-20">
          <BCMSRadioInput
            class={props.class}
            model-value={props.modelValue}
            options={props.options}
            label={props.label}
            name={props.name}
            disabled={props.disabled}
            helper-text={props.helperText}
            onUpdate:modelValue={action('input')}
          />
          <BCMSRadioInput
            model-value=""
            options={[
              {
                label: 'Option 1',
                value: 'option1',
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
              {
                label: 'Option 3',
                value: 'option3',
              },
            ]}
            label="Label"
          />
          <BCMSRadioInput
            model-value=""
            options={[
              {
                label: 'Option 1',
                value: 'option1',
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
              {
                label: 'Option 3',
                value: 'option3',
              },
            ]}
            label="Disabled"
            disabled
          />
          <BCMSRadioInput
            model-value=""
            options={[
              {
                label: 'Option 1',
                value: 'option1',
              },
              {
                label: 'Option 2',
                value: 'option2',
              },
              {
                label: 'Option 3',
                value: 'option3',
              },
            ]}
            label="With help"
            helper-text="Helper text"
          />
        </div>
      );
    };
  },
});

export default component;
