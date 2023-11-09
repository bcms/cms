import { PropType, defineComponent, ref } from 'vue';
import { DocSectionRequestBody } from '../../services';
import { DocVisualSchema } from './visual-schema';
import { BCMSButton, BCMSCodeEditor, BCMSTextInput } from '@ui/components';
import { File } from '../file';

export const DocRequest = defineComponent({
  props: {
    req: {
      type: Object as PropType<DocSectionRequestBody>,
      required: true,
    },
  },
  emits: {
    send: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const editBody = ref(false);

    return () => (
      <div class="flex flex-col">
        {props.req.visualSchema ? (
          <div class={editBody.value ? 'grid gap-2 grid-cols-2' : ''}>
            <DocVisualSchema
              class="flex-shrink-0"
              label="Body schema"
              schema={props.req.visualSchema}
              onDblClick={() => {
                editBody.value = true;
              }}
            />
            {editBody.value ? (
              <>
                {props.req.type === 'application/json' ? (
                  <div>
                    <BCMSCodeEditor
                      code={props.req.value}
                      onChange={(code) => {
                        props.req.value = code;
                        try {
                          JSON.parse(code);
                          props.req.err = '';
                        } catch (error) {
                          props.req.err = (error as Error).message;
                        }
                      }}
                    />
                    {props.req.err && (
                      <div class="text-pink">{props.req.err}</div>
                    )}
                  </div>
                ) : props.req.type === 'multipart/form-data' ? (
                  <div class="inputs">
                    {(props.req.value as any[]).map((prop) => {
                      if (prop.type === 'string') {
                        if (prop.format === 'binary') {
                          return (
                            <File
                              label={prop.name}
                              onInput={(files) => {
                                prop.value = files;
                              }}
                            />
                          );
                        } else {
                          return (
                            <BCMSTextInput
                              label={prop.name}
                              placeholder={prop.name}
                              value={prop.value}
                              onInput={(value) => {
                                prop.value = value;
                              }}
                            />
                          );
                        }
                      }
                      return '';
                    })}
                  </div>
                ) : (
                  ''
                )}
              </>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        <BCMSButton
          class="mt-2 ml-auto"
          onClick={() => {
            ctx.emit('send');
          }}
        >
          Send
        </BCMSButton>
      </div>
    );
  },
});
