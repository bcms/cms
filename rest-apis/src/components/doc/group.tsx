import { PropType, defineComponent } from 'vue';
import { DocGroup as DocGroupType } from '../../services/doc';
import { DefaultComponentProps } from '@ui/components/_default';

export const DocGroup = defineComponent({
  props: {
    ...DefaultComponentProps,
    group: { type: Object as PropType<DocGroupType>, required: true },
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div id={props.id} class={props.class} style={props.style}>
        <button
          class="text-2xl mb-4"
          onClick={() => {
            ctx.emit('click');
          }}
        >
          <h2>{props.group.name}</h2>
        </button>
        {props.group.extend && (
          <div>{ctx.slots.default ? ctx.slots.default() : ''}</div>
        )}
      </div>
    );
  },
});
