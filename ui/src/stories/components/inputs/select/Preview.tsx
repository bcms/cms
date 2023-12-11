import { PropType, defineComponent } from 'vue';
import { BCMSSelect } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { BCMSSelectOption } from '../../../../types';

const component = defineComponent({
  props: {
    class: String,
    label: String,
    placeholder: String,
    invalidText: String,
    helperText: String,
    disabled: Boolean,
    selected: String,
    options: {
      type: Array as PropType<BCMSSelectOption[]>,
      default: () => [],
    },
    showSearch: Boolean,
  },
  setup(props, ctx) {
    const options = [
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
    ];

    return () => {
      return (
        <div className="grid grid-cols-1 items-end gap-10 p-8 md:grid-cols-2 lg:grid-cols-3">
          <BCMSSelect
            class={props.class}
            label={props.label}
            placeholder={props.placeholder}
            invalid-text={props.invalidText}
            helper-text={props.helperText}
            disabled={props.disabled}
            selected={props.selected}
            options={props.options}
            show-search={props.showSearch}
            onChange={(val) => {
              ctx.emit('change', val);
              action('change');
            }}
          />
          <BCMSSelect label="Selected" selected="option1" options={options} />
          <BCMSSelect
            label="With placeholder"
            placeholder="Placeholder"
            options={options}
          />
          <BCMSSelect
            label="With error"
            invalid-text="Error text"
            selected="option1"
            options={options}
          />
          <BCMSSelect
            label="Disabled"
            disabled
            selected="option1"
            options={options}
          />
          <BCMSSelect
            label="With help"
            helper-text="Helper text"
            selected="option1"
            options={options}
          />
        </div>
      );
    };
  },
});

export default component;
