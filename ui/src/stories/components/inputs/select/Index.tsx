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
  setup(props) {
    return () => {
      return (
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
          onChange={action('change')}
        />
      );
    };
  },
});

export default component;
