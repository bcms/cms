import { PropType, defineComponent } from 'vue';
import { BCMSMarkdownInput } from '../../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    value: String,
    class: String,
    placeholder: String,
    label: String,
    invalidText: String,
    helperText: String,
    disabled: Boolean,
    minHeight: Number,
    additionalHelperSlot: Object as PropType<JSX.Element | string | undefined>,
  },
  setup(props) {
    return () => {
      return (
        <div className="flex items-end flex-wrap gap-10">
          <BCMSMarkdownInput
            class={props.class}
            value={props.value}
            placeholder={props.placeholder}
            label={props.label}
            invalid-text={props.invalidText}
            helper-text={props.helperText}
            disabled={props.disabled}
            minHeight={props.minHeight}
            onInput={action('input')}
          />
          <BCMSMarkdownInput label="Label" />
          <BCMSMarkdownInput
            placeholder="Placeholder"
            label="With placeholder"
          />
          <BCMSMarkdownInput label="With error" invalid-text="Error text" />
          <BCMSMarkdownInput label="Disabled" disabled />
          <BCMSMarkdownInput label="With help" helper-text="Helper text" />
          <BCMSMarkdownInput
            label="With additional help"
            helper-text="Helper text"
            additionalHelperSlot="Slot"
          />
          <BCMSMarkdownInput label="Min height 150px" min-height={150} />
        </div>
      );
    };
  },
});

export default component;
