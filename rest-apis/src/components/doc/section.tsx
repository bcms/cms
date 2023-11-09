import { PropType, defineComponent } from 'vue';
import { DocSection as DocSectionType } from '../../services';
import { securityStore } from '../../store';
import { Link, Markdown, SegmentLoader } from '..';
import { LockIcon, UnlockIcon } from '../icons';
import { DocParams } from './params';
import { DocRequest } from './request';
import { DocResponse } from './response';
import { DefaultComponentProps } from '@ui/components/_default';

export const DocSection = defineComponent({
  props: {
    ...DefaultComponentProps,
    section: {
      type: Object as PropType<DocSectionType>,
      required: true,
    },
  },
  emits: {
    extend: () => {
      return true;
    },
    send: () => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <div
        id={props.section.id}
        class={`border ${props.class || ''}`}
        style={props.style}
      >
        <SegmentLoader show={props.section.loading} />
        <Link
          href={props.section.id}
          class={`flex items-center gap-2 px-2 py-4 ${
            props.section.extend ? 'border-b' : ''
          } w-full`}
          onClick={() => {
            ctx.emit('extend');
          }}
        >
          <div class="uppercase px-2 border rounded">
            {props.section.method}
          </div>
          <div class="text-grey italic">{props.section.path}</div>
          <Markdown text={props.section.summary || ''} />
          {props.section.security && props.section.security.length > 0 ? (
            <button
              class="flex ml-auto"
              aria-label="Setup security"
              onClick={(event) => {
                event.preventDefault();
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
              <div>
                {props.section.security.find(
                  (e) =>
                    securityStore.value[e.name] &&
                    securityStore.value[e.name].value
                ) ? (
                  <LockIcon class="text-green w-4 h-4" />
                ) : (
                  <UnlockIcon class="text-pink w-4 h-4" />
                )}
              </div>
            </button>
          ) : (
            ''
          )}
        </Link>
        {props.section.extend && (
          <div class="p-4">
            <div>
              {props.section.description && (
                <Markdown class="mb-4" text={props.section.description} />
              )}
              {props.section.params.query.length > 0 ||
              props.section.params.header.length > 0 ||
              props.section.params.path.length > 0 ? (
                <div>
                  <DocParams
                    title="Headers"
                    params={props.section.params.header}
                  />
                  <DocParams
                    title="Path parameters"
                    params={props.section.params.path}
                  />
                  <DocParams
                    title="Queries"
                    params={props.section.params.query}
                  />
                </div>
              ) : (
                ''
              )}
              <DocRequest
                req={props.section.requestBodies[0]}
                onSend={() => {
                  ctx.emit('send');
                }}
              />
              <DocResponse res={props.section.responses[0]} />
            </div>
          </div>
        )}
      </div>
    );
  },
});
