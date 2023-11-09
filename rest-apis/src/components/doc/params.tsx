import { PropType, defineComponent } from 'vue';
import { DocSectionParam } from '../../services';
import { BCMSSelect, BCMSTextInput } from '@ui/components';

export const DocParams = defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    params: {
      type: Array as PropType<DocSectionParam[]>,
      required: true,
    },
  },
  emits: {
    change: (_value: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    return () => (
      <>
        {props.params.length > 0 ? (
          <div class="mb-4">
            <h3 class="text-xl mb-2">{props.title}</h3>
            <div class="flex flex-col gap-2">
              {props.params.map((param) => {
                return (
                  <div>
                    {param.enum ? (
                      <BCMSSelect
                        id={param.id}
                        label={param.prettyName + (param.required ? ' *' : '')}
                        placeholder={param.name}
                        helperText={param.description}
                        invalidText={param.err}
                        selected={param.value}
                        options={param.enum.map((e) => {
                          return {
                            label: e,
                            value: e,
                          };
                        })}
                        onChange={(options) => {
                          ctx.emit('change', options.value);
                        }}
                      />
                    ) : (
                      <BCMSTextInput
                        id={param.id}
                        label={param.prettyName + (param.required ? ' *' : '')}
                        placeholder={param.name}
                        helperText={param.description}
                        invalidText={param.err}
                        value={param.value}
                        onInput={(value) => {
                          ctx.emit('change', value);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          ''
        )}
      </>
    );
  },
});
