import { PropType, defineComponent } from 'vue';
import { DocSectionResponse } from '../../services';
import { DocVisualSchema } from './visual-schema';

export const DocResponse = defineComponent({
  props: {
    res: {
      type: Object as PropType<DocSectionResponse>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="mt-4">
        <div>
          <h3 class="text-xl">Response</h3>
        </div>
        {props.res.value && (
          <DocVisualSchema
            class="mt-2"
            label="Server response"
            schema={props.res.value || 'No server response'}
          />
        )}
        <DocVisualSchema
          class="mt-2"
          label="Response body schema"
          schema={props.res.visualSchema || 'No Schema provided'}
        />
      </div>
    );
  },
});
