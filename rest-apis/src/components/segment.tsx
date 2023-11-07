import { DefaultComponentProps } from '@ui/components/_default';
import { defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';

export const SegmentLoader = defineComponent({
  props: {
    ...DefaultComponentProps,
    show: Boolean,
    speed: {
      type: Number,
      default: 400,
    },
    dark: Boolean,
  },
  setup(props) {
    const animation = ref([true, true, true, true]);
    let state = false;
    let atIndex = 0;
    let timeout: NodeJS.Timeout;

    function animate() {
      clearTimeout(timeout);
      animation.value[atIndex] = state;
      atIndex++;
      if (atIndex === animation.value.length) {
        atIndex = 0;
        state = !state;
      }
      timeout = setTimeout(() => {
        animate();
      }, props.speed);
    }

    onMounted(() => {
      clearTimeout(timeout);
      if (props.show) {
        timeout = setTimeout(() => {
          animate();
        }, props.speed);
      }
    });
    onBeforeUpdate(() => {
      clearTimeout(timeout);
      if (props.show) {
        timeout = setTimeout(() => {
          animate();
        }, props.speed);
      }
    });

    return () => (
      <>
        {props.show ? (
          <div
            id={props.id}
            class={`segmentLoader ${props.class || ''}`}
            style={props.style}
          >
            {animation.value.map((value, idx) => (
              <div
                class={`segmentLoader--segment segmentLoader--segment_${idx} segmentLoader--segment_${value} ${
                  props.dark ? 'bg-gray-800' : ''
                }`}
              />
            ))}
          </div>
        ) : (
          <span />
        )}
      </>
    );
  },
});
