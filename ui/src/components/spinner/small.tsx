import { defineComponent } from 'vue';
import BCMSIcon from '../icon';
import { DefaultComponentProps } from '../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    show: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return () => {
      return (
        <>
          {props.show ? (
            <div
              id={props.id}
              class={`spinnerSmall ${props.class}`}
              style={props.style}
            >
              <BCMSIcon
                src="/cog"
                class="animate-spin"
                style="fill: rgba(19, 20, 26, 0.5); width: 40px; margin: auto auto 30px auto;"
              />
            </div>
          ) : (
            ''
          )}
        </>
      );
    };
  },
});
export default component;
