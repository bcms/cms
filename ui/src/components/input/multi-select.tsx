import { computed, defineComponent, onMounted, type PropType } from 'vue';
import type {
  BCMSMultiSelectItem,
  BCMSMultiSelectItemExtended,
} from '../../types';
import { DefaultComponentProps } from '../_default';
import InputWrapper from './_input';
import { useTranslation } from '../../translations';
import { BCMSEntryPointerOption } from './select';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    label: String,
    invalidText: String,
    helperText: String,
    addActionText: String,
    onlyOne: Boolean,
    title: String,
    items: {
      type: Array as PropType<BCMSMultiSelectItemExtended[]>,
      required: true,
    },
  },
  emits: {
    change: (_items: BCMSMultiSelectItem[]) => {
      return true;
    },
  },
  setup(props, ctx) {
    const store = window.bcms.vue.store;
    const translations = computed(() => {
      return useTranslation();
    });
    const selectedItems = computed(() =>
      props.items
        .filter((e) => e.selected)
        .map((e) => {
          if (e.imageId) {
            e.image = store.getters.media_findOne((m) => m._id === e.imageId);
          }
          return e;
        }),
    );

    onMounted(async () => {
      await window.bcms.util.throwable(async () => {
        await window.bcms.sdk.media.getAll();
      });
    });

    return () => (
      <InputWrapper
        class={props.class}
        label={props.label}
        invalidText={props.invalidText}
        helperText={props.helperText}
      >
        <button
          class={`w-full border rounded-3.5 overflow-hidden ${
            props.invalidText ? 'border-red' : 'border-grey'
          }`}
          onClick={() => {
            window.bcms.modal.multiSelect.show({
              title: props.title ? `Select ${props.title}` : undefined,
              items: props.items,
              onlyOne: props.onlyOne,
              onDone(data) {
                ctx.emit('change', data.items);
              },
            });
          }}
        >
          {selectedItems.value.length ? (
            <>
              {props.items
                .filter((item) => item.selected)
                .map((item, index) => (
                  <BCMSEntryPointerOption
                    option={{
                      label: item.title,
                      value: item.id,
                      imageId: item.imageId,
                      subtitle: item.subtitle,
                    }}
                    key={index}
                  />
                ))}
            </>
          ) : (
            <div class="dark:text-light">
              {translations.value.input.multiSelect.empty}
            </div>
          )}
        </button>
      </InputWrapper>
    );
  },
});
export default component;
