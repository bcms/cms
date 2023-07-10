import type {
  BCMSPluginPolicy,
  BCMSUserPolicyPlugin,
  BCMSUserPolicyPluginOption,
} from '@becomes/cms-sdk/types';
import { computed, defineComponent, type PropType } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSCheckboxInput, BCMSSelect, BCMSTextInput } from '../input';
import { BCMSIcon } from '..';

const component = defineComponent({
  props: {
    policySchema: {
      type: Array as PropType<BCMSPluginPolicy[]>,
      required: true,
    },
    policy: {
      type: Object as PropType<BCMSUserPolicyPlugin>,
      required: true,
    },
  },
  emits: {
    changeAccess: async (_state: boolean) => {
      return true;
    },
    changeFullAccess: async (_state: boolean) => {
      return true;
    },
    changeOption: async (_policyOptions: BCMSUserPolicyPluginOption[]) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    function handleOptionChange(
      schema: BCMSPluginPolicy,
      options: BCMSUserPolicyPluginOption,
    ) {
      const optionsMap: {
        [name: string]: BCMSUserPolicyPluginOption;
      } = {};
      for (let i = 0; i < props.policySchema.length; i++) {
        const s = props.policySchema[i];
        optionsMap[s.name] = {
          name: s.name,
          value: s.name === schema.name ? options.value : [],
        };
      }
      for (let i = 0; i < props.policy.options.length; i++) {
        const option = props.policy.options[i];
        if (option.name !== schema.name) {
          optionsMap[option.name] = {
            name: option.name,
            value: option.value,
          };
        }
      }
      let disableAccess = true;
      for (const name in optionsMap) {
        if (optionsMap[name].value.length > 0 && optionsMap[name].value[0]) {
          disableAccess = false;
          break;
        }
      }
      if (disableAccess) {
        ctx.emit('changeAccess', false);
      }
      ctx.emit(
        'changeOption',
        Object.keys(optionsMap).map((e) => optionsMap[e]),
      );
    }

    return () => (
      <div class="pluginPolicy">
        <h3 class="text-[28px] leading-tight font-normal text-pink mb-5">
          {window.bcms.util.string.toPretty(props.policy.name)}
        </h3>
        <BCMSCheckboxInput
          description={
            translations.value.page.plugin.input.fullAccess.description
          }
          value={props.policy.fullAccess && props.policy.allowed}
          onInput={(value) => {
            ctx.emit('changeFullAccess', value);
          }}
          class="mb-5"
        />
        {props.policySchema.length > 0 && !props.policy.fullAccess ? (
          <div class="pluginPolicy--options">
            <h4 class="text-lg mb-4 dark:text-light">
              {translations.value.page.plugin.title}
            </h4>
            {props.policySchema.map((schema) => {
              const policyOption = props.policy.options.find(
                (e) => e.name === schema.name,
              );
              if (schema.type === 'checkbox') {
                return (
                  <BCMSCheckboxInput
                    description={window.bcms.util.string.toPretty(schema.name)}
                    value={policyOption ? !!policyOption.value[0] : false}
                    onInput={(value) => {
                      if (value) {
                        ctx.emit('changeAccess', true);
                      }
                      handleOptionChange(schema, {
                        name: schema.name,
                        value: [value ? 'true' : ''],
                      });
                    }}
                    class="mb-5"
                  />
                );
              } else if (schema.type === 'select') {
                return (
                  <BCMSSelect
                    label={window.bcms.util.string.toPretty(schema.name)}
                    placeholder={window.bcms.util.string.toPretty(schema.name)}
                    options={
                      schema.options
                        ? schema.options.map((e) => {
                            return {
                              label: e,
                              value: e,
                            };
                          })
                        : []
                    }
                    selected={policyOption ? policyOption.value[0] : ''}
                    onChange={(option) => {
                      handleOptionChange(schema, {
                        name: schema.name,
                        value: [option.value],
                      });
                    }}
                    class="mb-5"
                  />
                );
              } else if (schema.type === 'selectArray') {
                return (
                  <div>
                    <div class="font-normal not-italic text-xs leading-normal tracking-0.06 select-none uppercase block mb-1.5  dark:text-light">
                      {window.bcms.util.string.toPretty(schema.name)}
                    </div>
                    <div class="grid grid-cols-1 gap-3 mb-5">
                      {((policyOption?.value || []).length > 0 ? policyOption?.value : ['false'])?.map((_, i) => {
                        return (
                          <div key={i} class="flex items-end gap-4">
                            <BCMSSelect
                              placeholder={window.bcms.util.string.toPretty(
                                schema.name,
                              )}
                              options={
                                schema.options
                                  ? schema.options.map((e) => {
                                      return {
                                        label: e,
                                        value: e,
                                      };
                                    })
                                  : []
                              }
                              selected={
                                policyOption ? policyOption.value[i] : ''
                              }
                              onChange={(option) => {
                                const value = policyOption?.value || []
                                value[i] = option.value
                                handleOptionChange(schema, {
                                  name: schema.name,
                                  value,
                                });
                              }}
                              class="flex-1"
                            />
                            {i === (policyOption?.value || [])?.length - 1 && (
                              <button
                                class="flex group"
                                onClick={() => {
                                  policyOption?.value.push('');
                                }}
                              >
                                <BCMSIcon
                                  src="/plus-circle"
                                  class="text-dark fill-current w-6 h-6 mb-3 transition-colors duration-200 group-hover:text-green group-focus-visible:text-green dark:text-light dark:group-hover:text-yellow dark:group-focus-visible:text-yellow"
                                />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else if (schema.type === 'input') {
                return (
                  <BCMSTextInput
                    label={window.bcms.util.string.toPretty(schema.name)}
                    placeholder={window.bcms.util.string.toPretty(schema.name)}
                    value={policyOption ? policyOption.value[0] : ''}
                    onInput={(value) => {
                      handleOptionChange(schema, {
                        name: schema.name,
                        value: [value],
                      });
                    }}
                    class="mb-5"
                  />
                );
              } else if (schema.type === 'inputArray') {
                return (
                  <div>
                    <div class="font-normal not-italic text-xs leading-normal tracking-0.06 select-none uppercase block mb-1.5  dark:text-light">
                      {window.bcms.util.string.toPretty(schema.name)}
                    </div>
                    <div class="grid grid-cols-1 gap-3 mb-5">
                      {policyOption?.value?.map((_, i) => {
                        return (
                          <div key={i} class="flex items-end gap-4">
                            <BCMSTextInput
                              placeholder={window.bcms.util.string.toPretty(
                                schema.name,
                              )}
                              value={policyOption ? policyOption.value[i] : ''}
                              onInput={(value) => {
                                const val = policyOption?.value || []
                                val[i] = value
                                handleOptionChange(schema, {
                                  name: schema.name,
                                  value: val,
                                });
                              }}
                              class="flex-1"
                            />
                            {i === (policyOption?.value || [])?.length - 1 && (
                              <button
                                class="flex group"
                                onClick={() => {
                                  policyOption?.value?.push('false');
                                }}
                              >
                                <BCMSIcon
                                  src="/plus-circle"
                                  class="text-dark fill-current w-6 h-6 mb-3 transition-colors duration-200 group-hover:text-green group-focus-visible:text-green dark:text-light dark:group-hover:text-yellow dark:group-focus-visible:text-yellow"
                                />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                return <div style="display: none;" />;
              }
            })}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  },
});
export default component;
