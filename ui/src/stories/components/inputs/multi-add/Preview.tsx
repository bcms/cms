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
    const value = ['Option 1', 'Option 2'];

    return () => {
      return (
        <div className="grid grid-cols-1 items-end gap-10 p-4 md:grid-cols-2 lg:grid-cols-3 lg:p-8">
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
          <BCMSMultiAddInput
            label="With placeholder"
            value={value}
            placeholder="Placeholder"
          />
          <BCMSMultiAddInput
            label="With error"
            value={value}
            invalid-text="Error text"
          />
          <BCMSMultiAddInput label="Disabled" value={value} disabled />
          <BCMSMultiAddInput
            label="With help"
            value={value}
            helper-text="Helper text"
          />
        </div>
      );
    };
  },
});

export default component;
