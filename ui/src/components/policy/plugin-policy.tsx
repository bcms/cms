import type {
  BCMSPluginPolicy,
  BCMSUserPolicyPlugin,
  BCMSUserPolicyPluginOption,
} from '@becomes/cms-sdk/types';
import { computed, defineComponent, type PropType } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSCheckboxInput, BCMSSelect } from '../input';

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
      options: BCMSUserPolicyPluginOption
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
        Object.keys(optionsMap).map((e) => optionsMap[e])
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
            <h4 class="font-semibold">
              {translations.value.page.plugin.title}
            </h4>
            {props.policySchema.map((schema) => {
              const policyOption = props.policy.options.find(
                (e) => e.name === schema.name
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
                      if (option.value) {
                        ctx.emit('changeAccess', true);
                      }
                      handleOptionChange(schema, {
                        name: schema.name,
                        value: [option.value],
                      });
                    }}
                  />
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
