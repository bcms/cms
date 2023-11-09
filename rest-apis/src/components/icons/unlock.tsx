import { DefaultComponentProps } from '@ui/components/_default';
import { defineComponent } from 'vue';

export const UnlockIcon = defineComponent({
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
          fill="currentColor"
          fill-rule="evenodd"
          d="M5 12a1 1 0 00-1 1v7a1 1 0 001 1h14a1 1 0 001-1v-7a1 1 0 00-1-1H5zm-3 1a3 3 0 013-3h14a3 3 0 013 3v7a3 3 0 01-3 3H5a3 3 0 01-3-3v-7z"
          clip-rule="evenodd"
        />
        <path
          fill="currentColor"
          d="M9.172 4.172A4 4 0 0116 7h2A6 6 0 106 7v4a1 1 0 102 0V7a4 4 0 011.172-2.828z"
        />
        <path
          fill="currentColor"
          d="M18 7a1 1 0 11-2 0 1 1 0 012 0z"
        />
      </svg>
    );
  },
});
