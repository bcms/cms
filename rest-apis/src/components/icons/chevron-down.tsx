import { defineComponent } from 'vue';
import { DefaultProps } from '../_default';

export const ChevronDown = defineComponent({
  props: {
    ...DefaultProps,
  },
  setup(props) {
    return () => (
      <svg
        id={props.id}
        style={props.style}
        class={props.class}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    );
  },
});
