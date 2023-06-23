import {
  computed,
  defineComponent,
  onMounted,
  type PropType,
  ref,
  TransitionGroup,
} from 'vue';
import { ColorPicker } from 'vue3-colorpicker';
import { DefaultComponentProps } from '../_default';
import { BCMSButton, BCMSIcon } from '..';
import { useTranslation } from '../../translations';
import InputWrapper from './_input';

const component = defineComponent({
  components: {
    ColorPicker,
  },
  props: {
    ...DefaultComponentProps,
    value: {
      type: String,
      required: true,
    },
    invalidText: String,
    placeholder: String,
    label: String,
    helperText: String,
    view: {
      type: String as PropType<'prop' | 'entry'>,
      default: 'prop',
    },
    allowCustom: Boolean,
    allowGlobal: {
      type: Boolean,
      default: true,
    },
    allowCustomForce: Boolean,
    allowCreateColor: Boolean,
    propPath: String,
  },
  emits: {
    change: (_value: string) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = useTranslation();
    const store = window.bcms.vue.store;
    const throwable = window.bcms.util.throwable;
    const selectedColor = ref({
      id: '',
      value: '#249681',
    });
    const hexColorBuffer = ref(selectedColor.value.value.slice(1));
    const colors = computed(() => {
      return store.getters.color_find((e) => e.global);
    });
    const colorWheelVisible = ref(false);

    async function createColor() {
      if (colors.value.find((e) => e.value === selectedColor.value.value)) {
        window.bcms.notification.warning(
          translations.input.color.error.duplicateValue
        );
        return;
      }
      await throwable(async () => {
        return await window.bcms.sdk.color.create({
          label: selectedColor.value.value,
          value: selectedColor.value.value,
          global: true,
        });
      });
    }

    async function deleteColor(id: string) {
      await throwable(async () => {
        return await window.bcms.sdk.color.deleteById(id);
      });
    }

    onMounted(async () => {
      await window.bcms.util.throwable(async () => {
        await window.bcms.sdk.color.getAll();
      });
      if (props.value.startsWith('#')) {
        selectedColor.value = {
          id: '',
          value: props.value,
        };
      } else {
        const color = store.getters.color_findOne((e) => e._id === props.value);

        if (color) {
          selectedColor.value = {
            id: color._id,
            value: color.value,
          };
        }
      }

      if (props.view === 'entry' && props.value) {
        colorWheelVisible.value = true;
      }
    });

    return () => (
      <InputWrapper
        id={props.id}
        class={props.class}
        label={props.label}
        helperText={props.helperText}
        invalidText={props.invalidText}
      >
        <div
          data-bcms-prop-path={props.propPath}
          class={`flex flex-col gap-6 ${
            props.view === 'entry'
              ? colorWheelVisible.value
                ? 'sm:flex-row sm:items-start'
                : 'sm:flex-col-reverse'
              : 'sm:flex-row sm:items-start gap-4'
          } ${props.label ? 'mt-1.5' : ''} ${props.helperText ? 'mb-3' : ''}`}
        >
          {props.allowCustom && (
            <div class="flex-1">
              {props.allowCustomForce || colorWheelVisible.value ? (
                <>
                  <ColorPicker
                    format="hex"
                    pickerType="chrome"
                    isWidget={true}
                    disableHistory={true}
                    disableAlpha={true}
                    pureColor={selectedColor.value.value}
                    onPureColorChange={(value: string) => {
                      if (value !== selectedColor.value.value) {
                        selectedColor.value = {
                          id: '',
                          value,
                        };
                        hexColorBuffer.value =
                          selectedColor.value.value.slice(1);
                        ctx.emit('change', value);
                      }
                    }}
                  />
                  <div class="w-[300px] max-w-full flex items-center justify-between pr-[11px] pl-4.5 border border-grey border-opacity-50 rounded-3xl leading-tight -tracking-0.01">
                    <div class="flex items-center flex-1 dark:text-light">
                      <span>#</span>
                      <input
                        value={hexColorBuffer.value}
                        class="w-full max-w-full pl-2.5 py-[11px] bg-transparent focus:outline-none"
                        onKeyup={(event) => {
                          const target = event.target as HTMLInputElement;
                          target.value = target.value.replace(
                            /[^0-9a-f]+/g,
                            ''
                          );
                          if (target.value.length > 6) {
                            target.value = target.value.substring(
                              target.value.length - 6
                            );
                          }
                          if (
                            target.value.length === 6 &&
                            target.value !== hexColorBuffer.value &&
                            window.bcms.util.color.check(target.value)
                          ) {
                            hexColorBuffer.value = target.value;
                            selectedColor.value = {
                              id: '',
                              value: `#${hexColorBuffer.value}`,
                            };
                          }
                        }}
                        // onKeypress={(event) => {
                        //   const target = event.target as HTMLInputElement;
                        //   if (
                        //     event.key === 'Enter' &&
                        //     target.value.length === 6 &&
                        //     window.bcms.util.color.check(target.value)
                        //   ) {
                        //     createColor();
                        //   }
                        // }}
                      />
                    </div>
                    {props.allowCreateColor && (
                      <div class="flex-shrink-0">
                        <button
                          class="group flex items-center"
                          onClick={createColor}
                        >
                          <span class="font-semibold mr-2.5 transition-colors duration-200 group-hover:text-green group-focus-visible:text-green dark:text-light dark:group-hover:text-yellow">
                            {translations.input.color.actions.addToList}
                          </span>
                          <BCMSIcon
                            src="/plus-circle"
                            class="text-dark fill-current w-6 h-6 transition-colors duration-200 group-hover:text-green group-focus-visible:text-green dark:text-light dark:group-hover:text-yellow dark:group-focus-visible:text-yellow"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                props.view === 'entry' && (
                  <BCMSButton
                    onClick={() => {
                      colorWheelVisible.value = true;
                    }}
                  >
                    {translations.input.color.actions.chooseOtherColor}
                  </BCMSButton>
                )
              )}
            </div>
          )}
          {props.allowGlobal && (
            <div
              class={`min-w-[120px] ${props.view === 'entry' ? 'w-full' : ''}`}
            >
              {colors.value.length === 0 ? (
                <div class="text-sm text-grey font-medium">
                  {translations.input.color.actions.addColors}
                </div>
              ) : (
                <div
                  class={`grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] ${
                    props.view === 'entry' ? 'gap-5 px-2' : 'gap-2.5'
                  }`}
                >
                  <TransitionGroup name="fade" appear={true} duration={300}>
                    {colors.value.map((color, index) => {
                      return (
                        <button
                          class={`group w-12 h-12 rounded-full shadow-btnSecondary flex justify-center items-center ${
                            color._id === selectedColor.value.id
                              ? 'outline-pink'
                              : ''
                          } ${
                            props.view === 'entry' &&
                            selectedColor.value.value !== color.value
                              ? 'opacity-60'
                              : ''
                          } hover:opacity-100 focus-visible:opacity-100`}
                          title={color.value}
                          style={{
                            backgroundColor: color.value,
                            outline:
                              props.view === 'entry' &&
                              selectedColor.value.value === color.value
                                ? '1px solid #ecada9'
                                : '1px solid transparent',
                            outlineOffset: props.view === 'entry' ? '10px' : '',
                            transition:
                              props.view === 'entry'
                                ? 'outline-color 0.3s, opacity 0.3s'
                                : '',
                          }}
                          key={index}
                          aria-label="Remove color"
                          onClick={() => {
                            if (selectedColor.value.id === color._id) {
                              selectedColor.value = {
                                id: '',
                                value: '',
                              };
                              ctx.emit('change', '');
                              return;
                            }
                            if (props.allowCreateColor) {
                              deleteColor(color._id);
                            } else {
                              selectedColor.value = {
                                value: color.value,
                                id: color._id,
                              };
                              ctx.emit('change', color._id);
                            }
                          }}
                        >
                          {props.allowCreateColor && props.view === 'prop' && (
                            <BCMSIcon
                              src="/trash"
                              class="opacity-0 w-6 h-6 text-white fill-current transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                            />
                          )}
                        </button>
                      );
                    })}
                  </TransitionGroup>
                </div>
              )}
            </div>
          )}
        </div>
      </InputWrapper>
    );
  },
});

export default component;
