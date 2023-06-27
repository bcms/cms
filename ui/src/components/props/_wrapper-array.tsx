import { computed, defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '../_default';
import BCMSButton from '../button';
import type { BCMSPropValueExtended } from '../../types';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    error: Boolean,
    prop: {
      type: Object as PropType<BCMSPropValueExtended>,
      required: true,
    },
  },
  emits: {
    add: () => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });

    return () => (
      <div class={`${props.class}`}>
        {props.error && (
          <p class="text-red leading-normal select-none mb-3">
            {translations.value.prop.input.error.emptyArray}
          </p>
        )}
        {ctx.slots.default ? <div>{ctx.slots.default()}</div> : ''}
        <BCMSButton
          size="m"
          onClick={(event) => {
            event.stopPropagation();
            ctx.emit('add');
          }}
        >
          {translations.value.prop.wrapperArray.actionName({
            label: props.prop.label,
          })}
        </BCMSButton>
      </div>
    );
  },
});
export default component;
