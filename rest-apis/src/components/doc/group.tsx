import { PropType, defineComponent } from 'vue';
import { DocGroup as DocGroupType } from '../../services/doc';

export const DocGroup = defineComponent({
  props: {
    group: { type: Object as PropType<DocGroupType>, required: true },
  },
  emits: {
    click: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div>
        <button
          class="text-2xl"
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
