import { PropType, defineComponent } from 'vue';
import { BCMSToggleInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    value: Boolean,
    label: String,
    disabled: Boolean,
    states: Object as PropType<[string, string]>,
    helperText: String,
  },
  setup(props, ctx) {
    return () => {
      return (
        <div className="flex items-end flex-wrap justify-between gap-10 p-4">
          <BCMSToggleInput
            class={props.class}
            value={props.value}
            label={props.label}
            disabled={props.disabled}
            states={props.states}
            helper-text={props.helperText}
            onInput={() => {
              ctx.emit('input');
              action('input');
            }}
          />
          <BCMSToggleInput value />
          <BCMSToggleInput value label="Label" />
          <BCMSToggleInput label="Disabled" disabled />
          <BCMSToggleInput value label="With help" helper-text="Helper text" />
          <BCMSToggleInput value label="With states" states={['On', 'Off']} />
        </div>
      );
    };
  },
});

export default component;
