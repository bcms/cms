import { defineComponent } from 'vue';
import { DefaultComponentProps } from '../_default';
import type { BCMSManagerNavItemType } from '../../types';
import { BCMSPasswordInput } from '../input';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
      default: '',
    },
  },
  emits: {
    open: (_event: Event, _item: BCMSManagerNavItemType) => {
      return true;
    },
  },
  setup(props) {
    return () => (
      <div class={`max-w-[600px] mt-5 ${props.class}`}>
        <div class="relative">
          <BCMSPasswordInput
            label={props.label}
            value={props.secret}
            readonly={true}
          />
        </div>
      </div>
    );
  },
});
export default component;
