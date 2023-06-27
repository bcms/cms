import { defineComponent, onUnmounted, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { onBeforeUpdate } from 'vue';
import { DefaultComponentProps } from './_default';

const handlers: {
  [id: string]: () => void;
} = {};
setInterval(() => {
  for (const id in handlers) {
    handlers[id]();
  }
}, 60000);

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    timestamp: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const dateUtil = window.bcms.util.date;
    let timestampBuffer = 0;
    const timeString = ref(dateUtil.prettyElapsedTimeSince(props.timestamp));
    const id = uuidv4();
    handlers[id] = () => {
      timeString.value = dateUtil.prettyElapsedTimeSince(props.timestamp);
    };

    onBeforeUpdate(() => {
      if (props.timestamp !== timestampBuffer) {
        timestampBuffer = props.timestamp;
        timeString.value = dateUtil.prettyElapsedTimeSince(props.timestamp);
      }
    });

    onUnmounted(() => {
      delete handlers[id];
    });

    return () => (
      <span
        id={props.id}
        class={props.class}
        style={props.style}
        v-cy={props.cyTag}
      >
        {timeString.value}
      </span>
    );
  },
});
export default component;
