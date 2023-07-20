import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { DefaultComponentProps } from '../../_default';
import type { BCMSSelectOption } from '../../../types';
import { BCMSStoreMutationTypes } from '../../../types';
import BCMSSelect from './main';
import { useTranslation } from '../../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    exclude: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    selected: String,
    invalidText: String,
  },
  emits: {
    change: (_value: BCMSSelectOption) => {
      return true;
    },
  },
  setup(props, ctx) {
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const translations = computed(() => {
      return useTranslation();
    });
    const templates = computed(() => {
      return store.getters.template_items;
    });

    onMounted(async () => {
      if (templates.value.length === 0) {
        await throwable(
          async () => {
            return await window.bcms.sdk.template.getAll();
          },
          async (result) => {
            store.commit(BCMSStoreMutationTypes.template_set, result);
          }
        );
      }
    });

    return () => (
      <BCMSSelect
        cyTag={props.cyTag ? props.cyTag : 'entryPointer'}
        class={props.class}
        label={translations.value.input.entryPointer.label}
        placeholder={translations.value.input.entryPointer.placeholder}
        invalidText={props.invalidText}
        options={templates.value.map((e) => {
          return { label: e.label, value: e._id };
        })}
        selected={[props.selected ? props.selected : '']}
        disabled={templates.value.length === 0}
        onChange={(value) => {
          ctx.emit('change', value);
        }}
      />
    );
  },
});
export default component;
