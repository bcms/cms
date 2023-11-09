import { PropType, defineComponent } from 'vue';
import type { DocComponent as DocComponentType } from '../../services';
import { Link } from '..';
import { DocVisualSchema } from './visual-schema';

export const DocComponent = defineComponent({
  props: {
    comp: {
      type: Object as PropType<DocComponentType>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div id={props.comp.id} class="border">
        <Link
          href={props.comp.id}
          class="text-xl"
          onClick={() => {
            props.comp.extended = !props.comp.extended;
            // Service.docNav.push(`#${data.id}`, {
            //   silent: true,
            //   state: data.extended ? 'open' : 'close',
            // });
          }}
        >
          <h3>{props.comp.name}</h3>
        </Link>
        {props.comp.extended && (
          <div class="border-t">
            <DocVisualSchema schema={props.comp.visualSchema} />
          </div>
        )}
      </div>
    );
  },
});
