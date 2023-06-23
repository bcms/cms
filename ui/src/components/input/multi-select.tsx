import {
  computed,
  defineComponent,
  onMounted,
  type PropType,
} from 'vue';
import type {
  BCMSMultiSelectItem,
  BCMSMultiSelectItemExtended,
} from '../../types';
import { DefaultComponentProps } from '../_default';
import InputWrapper from './_input';
import BCMSImage from '../image';
import { useTranslation } from '../../translations';

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
        })
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
          class={`w-full grid grid-cols-[auto] gap-2.5 border rounded-3.5 pt-3 pr-6 pb-2.5 pl-4.5 ${
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
                .map((item) => (
                  <div class="text-left">
                    {item.image ? (
                      <div class="grid grid-cols-[auto,80px] gap-5">
                        <div>
                          <div class="dark:text-light">{item.title}</div>
                          {item.subtitle ? (
                            <div class="text-grey text-xs mt-2.5">
                              {item.subtitle}
                            </div>
                          ) : (
                            ''
                          )}
                        </div>
                        <div class="w-20 h-20 overflow-hidden rounded-3.5">
                          <BCMSImage
                            media={item.image}
                            alt={item.title}
                            class="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div class="dark:text-light">{item.title}</div>
                        {item.subtitle ? (
                          <div class="text-grey text-xs mt-2.5">
                            {item.subtitle}
                          </div>
                        ) : (
                          ''
                        )}
                      </>
                    )}
                  </div>
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
