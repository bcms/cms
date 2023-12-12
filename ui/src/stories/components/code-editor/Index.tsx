import { defineComponent } from 'vue';
import { BCMSCodeEditor } from '../../../components';
import { action } from '@storybook/addon-actions';
import React from 'react';

const component = defineComponent({
  props: {
    class: String,
    code: String,
    readOnly: Boolean,
  },
  setup(props) {
    return () => {
      return (
        <div className="mb-5">
          <BCMSCodeEditor
            class={props.class}
            code={props.code}
            readOnly={props.readOnly}
            onChange={action('change')}
          />
        </div>
      );
    };
  },
});

export default component;
