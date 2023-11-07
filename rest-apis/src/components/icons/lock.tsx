import { DefaultComponentProps } from '@ui/components/_default';
import { defineComponent } from 'vue';

export const LockIcon = defineComponent({
  props: {
    ...DefaultComponentProps,
  },
  setup(props) {
    return () => (
      <svg
        id={props.id}
        style={props.style}
        class={props.class}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          fill="#000"
          fill-rule="evenodd"
          d="M5 12a1 1 0 00-1 1v7a1 1 0 001 1h14a1 1 0 001-1v-7a1 1 0 00-1-1H5zm-3 1a3 3 0 013-3h14a3 3 0 013 3v7a3 3 0 01-3 3H5a3 3 0 01-3-3v-7z"
          clip-rule="evenodd"
        />
        <path
          fill="#000"
          fill-rule="evenodd"
          d="M12 3a4 4 0 00-4 4v4a1 1 0 11-2 0V7a6 6 0 1112 0v4a1 1 0 11-2 0V7a4 4 0 00-4-4z"
          clip-rule="evenodd"
        />
      </svg>
    );
  },
});
