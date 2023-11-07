import { PropType, defineComponent } from 'vue';
import { DocSection as DocSectionType } from '../../services';
import { securityStore } from '../../store';
import { Markdown, SegmentLoader } from '..';
import { LockIcon, UnlockIcon } from '../icons';

export const DocSection = defineComponent({
  props: {
    section: {
      type: Object as PropType<DocSectionType>,
      required: true,
    },
  },
  emits: {
    extend: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div id={props.section.id}>
        <SegmentLoader show={props.section.loading} />
        <button
          class="flex items-center gap-2 px-2 py-4 border w-full"
          onClick={() => {
            ctx.emit('extend');
          }}
        >
          <div class="uppercase px-2 border rounded">{props.section.method}</div>
          <div class="text-grey italic">{props.section.path}</div>
          <Markdown text={props.section.summary || ''} />
          {props.section.security && props.section.security.length > 0 ? (
            <button
              aria-label="Setup security"
              onClick={(event) => {
                event.stopPropagation();
                // Service.modal.security.show({
                //   onlyShow: data.security.map((e) => e.name),
                //   onDone(data) {
                //     for (let i = 0; i < data.items.length; i++) {
                //       const item = data.items[i];
                //       if ($securityStore[item.name]) {
                //         $securityStore[item.name].value = item.value;
                //       }
                //     }
                //   },
                // });
              }}
            >
              {props.section.security.find(
                (e) =>
                  securityStore.value[e.name] &&
                  securityStore.value[e.name].value
              ) ? (
                <LockIcon />
              ) : (
                <UnlockIcon />
              )}
            </button>
          ) : (
            ''
          )}
        </button>
        {props.section.extend && (
          <div>
            <div>
              {props.section.description && (
                <Markdown text={props.section.description} />
              )}
              {props.section.params.query.length > 0 ||
              props.section.params.header.length > 0 ||
              props.section.params.path.length > 0 ? (
                <div>
                  {/* <Params title="Headers" data={data.params.header} />
                <Params title="Path parameters" data={data.params.path} />
                <Params title="Queries" data={data.params.query} /> */}
                </div>
              ) : (
                ''
              )}
              {/* <Request data={data.requestBodies[0]} on:send />
            <Response data={data.responses[0]} /> */}
            </div>
          </div>
        )}
      </div>
    );
  },
});
