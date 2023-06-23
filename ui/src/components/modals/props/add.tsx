import { computed, defineComponent, ref } from 'vue';
import type {
  BCMSProp,
  BCMSPropEnumData,
  BCMSPropEntryPointerData,
  BCMSPropGroupPointerData,
} from '@becomes/cms-sdk/types';
import type { BCMSPropColorPickerData } from '@becomes/cms-sdk/types/models/prop/color-picker';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import {
  BCMSTextInput,
  BCMSMultiAddInput,
  BCMSGroupPointerSelect,
  BCMSEntryPointerSelect,
  BCMSToggleInput,
  BCMSMultiSelect,
  BCMSRadioInput,
  BCMSColorPickerInput,
} from '../../input';
import Modal from '../_modal';
import type {
  BCMSAddPropertyModalLocation,
  BCMSAddPropModalInputData,
  BCMSAddPropModalOutputData,
  BCMSModalInputDefaults,
} from '../../../types';
import BCMSButton from '../../button';
import { useTranslation } from '../../../translations';

interface Data extends BCMSModalInputDefaults<BCMSAddPropModalOutputData> {
  title: string;
  stage: number;
  location: BCMSAddPropertyModalLocation;
  entityId: string;
  prop: BCMSProp;
  takenPropNames: string[];
  errors: {
    name: string;
    enum: string;
    groupPointer: string;
    entryPointer: string;
  };
  types: Array<{
    name: string;
    desc: string;
    value: BCMSPropType;
    hide?: boolean;
  }>;
  selected: {
    type: BCMSPropType;
    entryPointer: string;
    groupPointer: string;
  };
}

const component = defineComponent({
  components: {
    Modal,
    BCMSButton,
    BCMSTextInput,
    BCMSMultiAddInput,
    BCMSGroupPointerSelect,
    BCMSEntryPointerSelect,
    BCMSToggleInput,
  },
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const stage = ref(0);
    const store = window.bcms.vue.store;
    const title = ref(translations.value.modal.addProp.title);
    const modalData = ref(getData());
    const templates = computed(() => store.getters.template_items);
    const selectedColorPickerOption = ref<
      'pre-defined' | 'custom' | 'pre-defined-custom'
    >('pre-defined');
    window.bcms.modal.props.add = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        title.value = modalData.value.title;
        show.value = true;
        window.bcms.util.throwable(async () => {
          await window.bcms.sdk.template.getAll();
        });
      },
    };
    const colorPropId = ref('');

    function getData(inputData?: BCMSAddPropModalInputData) {
      stage.value = 0;
      const d: Data = {
        stage: 0,
        title: translations.value.modal.addProp.title,
        location: 'template',
        entityId: '',
        takenPropNames: ['title', 'slug'],
        prop: {
          id: '',
          label: '',
          name: '',
          type: BCMSPropType.STRING,
          array: false,
          required: false,
          defaultData: [''],
        },
        errors: {
          name: '',
          enum: '',
          groupPointer: '',
          entryPointer: '',
        },
        types: [
          {
            name: translations.value.modal.addProp.type.string.label,
            desc: translations.value.modal.addProp.type.string.description,
            value: BCMSPropType.STRING,
          },
          {
            name: translations.value.modal.addProp.type.richText.label,
            desc: translations.value.modal.addProp.type.richText.description,
            value: BCMSPropType.RICH_TEXT,
          },
          {
            name: translations.value.modal.addProp.type.number.label,
            desc: translations.value.modal.addProp.type.number.description,
            value: BCMSPropType.NUMBER,
          },
          {
            name: translations.value.modal.addProp.type.date.label,
            desc: translations.value.modal.addProp.type.date.description,
            value: BCMSPropType.DATE,
          },
          {
            name: translations.value.modal.addProp.type.boolean.label,
            desc: translations.value.modal.addProp.type.boolean.description,
            value: BCMSPropType.BOOLEAN,
          },
          {
            name: translations.value.modal.addProp.type.enumeration.label,
            desc: translations.value.modal.addProp.type.enumeration.description,
            value: BCMSPropType.ENUMERATION,
          },
          {
            name: translations.value.modal.addProp.type.media.label,
            desc: translations.value.modal.addProp.type.media.description,
            value: BCMSPropType.MEDIA,
          },
          {
            name: translations.value.modal.addProp.type.groupPointer.label,
            desc: translations.value.modal.addProp.type.groupPointer
              .description,
            value: BCMSPropType.GROUP_POINTER,
            hide: true,
          },
          {
            name: translations.value.modal.addProp.type.entryPointer.label,
            desc: translations.value.modal.addProp.type.entryPointer
              .description,
            value: BCMSPropType.ENTRY_POINTER,
            hide: true,
          },
        ],
        selected: {
          type: BCMSPropType.STRING,
          entryPointer: '',
          groupPointer: '',
        },
      };
      if (store.getters.feature_available('color_picker')) {
        d.types.push({
          name: translations.value.modal.addProp.type.colorPicker.label,
          desc: translations.value.modal.addProp.type.colorPicker.description,
          value: BCMSPropType.COLOR_PICKER,
        });
      }
      if (inputData) {
        if (inputData.title) {
          d.title = inputData.title;
        }
        if (inputData.onDone) {
          d.onDone = inputData.onDone;
        }
        if (inputData.onCancel) {
          d.onCancel = inputData.onCancel;
        }
        if (inputData.takenPropNames) {
          d.takenPropNames = inputData.takenPropNames;
        }
        d.location = inputData.location;
        d.entityId = inputData.entityId;
      }
      return d;
    }
    function cancel() {
      if (modalData.value.onCancel) {
        const result = modalData.value.onCancel();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.props.add.hide();
    }
    async function done() {
      if (modalData.value.prop.label.replace(/ /g, '') === '') {
        modalData.value.errors.name =
          translations.value.modal.addProp.error.emptyLabel;
        return;
      } else if (
        modalData.value.takenPropNames.includes(
          window.bcms.util.string.toSlugUnderscore(modalData.value.prop.label),
        )
      ) {
        modalData.value.errors.name =
          translations.value.modal.addProp.error.duplicateLabel;
        return;
      }
      modalData.value.errors.name = '';
      if (
        modalData.value.prop.type === BCMSPropType.GROUP_POINTER &&
        (modalData.value.prop.defaultData as BCMSPropGroupPointerData)._id ===
          ''
      ) {
        modalData.value.errors.groupPointer =
          translations.value.modal.addProp.error.emptyGroupPointer;
        return;
      }
      modalData.value.errors.groupPointer = '';
      if (
        modalData.value.prop.type === BCMSPropType.ENTRY_POINTER &&
        (modalData.value.prop.defaultData as BCMSPropEntryPointerData[])
          .length === 0
      ) {
        modalData.value.errors.entryPointer =
          translations.value.modal.addProp.error.emptyTemplatePointer;
        return;
      }
      modalData.value.errors.entryPointer = '';
      if (
        modalData.value.prop.type === BCMSPropType.ENUMERATION &&
        (modalData.value.prop.defaultData as BCMSPropEnumData).items.length ===
          0
      ) {
        modalData.value.errors.enum =
          translations.value.modal.addProp.error.emptyEnumeration;
        return;
      }
      modalData.value.errors.enum = '';
      if (
        modalData.value.prop.type === BCMSPropType.COLOR_PICKER &&
        stage.value === 1
      ) {
        await window.bcms.util.throwable(
          async () => {
            return await window.bcms.sdk[modalData.value.location].update({
              _id: modalData.value.entityId,
              propChanges: [
                {
                  add: {
                    label: modalData.value.prop.label,
                    type: BCMSPropType.COLOR_PICKER,
                    required: modalData.value.prop.required,
                    array: modalData.value.prop.array,
                    defaultData: getColorPickerOptions(),
                  },
                },
              ],
            });
          },
          async (entity) => {
            const colorProp = entity.props[entity.props.length - 1];
            colorPropId.value = colorProp.id;

            stage.value++;
          },
        );
        return;
      }
      if (modalData.value.onDone) {
        if (modalData.value.prop.type !== BCMSPropType.COLOR_PICKER) {
          const result = modalData.value.onDone(modalData.value.prop);
          if (result instanceof Promise) {
            result.catch((error) => {
              console.error(error);
            });
          }
        }
      }
      window.bcms.modal.props.add.hide();
    }
    function getColorPickerOptions(): BCMSPropColorPickerData {
      return {
        allowCustom:
          selectedColorPickerOption.value === 'pre-defined' ? false : true,
        allowGlobal:
          selectedColorPickerOption.value === 'custom' ? false : true,
        selected: [],
      };
    }
    async function back() {
      if (
        modalData.value.prop.type === BCMSPropType.COLOR_PICKER &&
        stage.value === 2 &&
        colorPropId.value
      ) {
        await window.bcms.util.throwable(
          async () => {
            await window.bcms.sdk[modalData.value.location].update({
              _id: modalData.value.entityId,
              propChanges: [
                {
                  remove: colorPropId.value,
                },
              ],
            });
          },
          async () => {
            colorPropId.value = '';
            stage.value--;
          },
        );
      } else {
        stage.value--;
      }
    }
    function next() {
      switch (stage.value) {
        case 0: {
          if (!modalData.value.selected.type) {
            window.bcms.notification.warning(
              translations.value.modal.addProp.error.emptyType,
            );
            return;
          }
          switch (modalData.value.selected.type) {
            case BCMSPropType.STRING:
              {
                modalData.value.prop.type = BCMSPropType.STRING;
                modalData.value.prop.defaultData = [''];
              }
              break;
            case BCMSPropType.RICH_TEXT:
              {
                modalData.value.prop.type = BCMSPropType.RICH_TEXT;
                modalData.value.prop.defaultData = [
                  {
                    nodes: [],
                  },
                ];
              }
              break;
            case BCMSPropType.NUMBER:
              {
                modalData.value.prop.type = BCMSPropType.NUMBER;
                modalData.value.prop.defaultData = [0];
              }
              break;
            case BCMSPropType.DATE:
              {
                modalData.value.prop.type = BCMSPropType.DATE;
                modalData.value.prop.defaultData = [0];
              }
              break;
            case BCMSPropType.BOOLEAN:
              {
                modalData.value.prop.type = BCMSPropType.BOOLEAN;
                modalData.value.prop.defaultData = [false];
              }
              break;
            case BCMSPropType.ENUMERATION:
              {
                modalData.value.prop.type = BCMSPropType.ENUMERATION;
                (modalData.value.prop.defaultData as BCMSPropEnumData) = {
                  items: [],
                  selected: '',
                };
              }
              break;
            case BCMSPropType.MEDIA:
              {
                modalData.value.prop.type = BCMSPropType.MEDIA;
                modalData.value.prop.defaultData = [''];
              }
              break;
            case BCMSPropType.GROUP_POINTER:
              {
                window.bcms.util.throwable(async () => {
                  await window.bcms.sdk.group.getAll();
                });
                modalData.value.prop.type = BCMSPropType.GROUP_POINTER;
                const value: BCMSPropGroupPointerData = {
                  _id: '',
                };
                modalData.value.prop.defaultData = value;
              }
              break;
            case BCMSPropType.ENTRY_POINTER:
              {
                modalData.value.prop.type = BCMSPropType.ENTRY_POINTER;
                const value: BCMSPropEntryPointerData[] = [];
                modalData.value.prop.defaultData = value;
              }
              break;
            case BCMSPropType.COLOR_PICKER: {
              modalData.value.prop.type = BCMSPropType.COLOR_PICKER;
              const value: BCMSPropColorPickerData = getColorPickerOptions();
              modalData.value.prop.defaultData = value;
            }
          }
          stage.value++;
          return;
        }
      }
    }

    const enumLogic = {
      format(value: string): string {
        return window.bcms.util.string.toEnum(value);
      },
      validate(items: string[]): string | null {
        if (
          items.splice(0, items.length - 1).includes(items[items.length - 1])
        ) {
          return translations.value.modal.addProp.error.duplicateEnumeration({
            label: items[items.length - 1],
          });
        }
        return null;
      },
      addItems(items: string[]): void {
        (modalData.value.prop.defaultData as BCMSPropEnumData).items = items;
      },
    };

    const slots = {
      header: () => (
        <div>
          {stage.value === 0 ? (
            <div class="text-dark text-4xl -tracking-0.03 font-normal line-break-anywhere w-full dark:text-light">
              {translations.value.modal.addProp.title}
            </div>
          ) : (
            <button class="flex items-center p-[5px]" onClick={back}>
              <span class="mr-2.5 dark:text-light">&#9666;</span>
              <h2 class="text-dark text-4xl -tracking-0.03 font-normal line-break-anywhere w-full dark:text-light">
                {window.bcms.util.string.toPretty(
                  modalData.value.selected.type,
                )}
              </h2>
            </button>
          )}
        </div>
      ),
      actions: () => (
        <div>
          {stage.value > 0 && (
            <>
              <BCMSButton
                kind="ghost"
                onClick={back}
                class="text-pink hover:text-red hover:shadow-none focus:text-red focus:shadow-none"
              >
                {translations.value.modal.addProp.actionSlot.backLabel}
              </BCMSButton>
              <BCMSButton onClick={done}>
                <span>
                  {translations.value.modal.addProp.actionSlot.createLabel}
                </span>
              </BCMSButton>
            </>
          )}
        </div>
      ),
    };

    return () => (
      <Modal
        title={title.value}
        show={show.value}
        onDone={done}
        onCancel={cancel}
        class="bcmsModal_addProp"
        doNotShowFooter={stage.value === 0}
        v-slots={slots}
      >
        <div class="mb-4 overflow-y-auto px-7.5 xs:px-10">
          {stage.value === 0 ? (
            <div>
              {modalData.value.types.map((propType) => {
                return (
                  <button
                    onClick={() => {
                      modalData.value.selected.type = propType.value;
                      next();
                    }}
                    class="group bg-light bg-opacity-50 border border-grey rounded-3xl w-full text-left transition-all duration-200 flex items-center py-[15px] px-5 text-base leading-tight mb-5 hover:border-green focus:border-green disabled:hover:border-dark disabled:hover:border-opacity-30 disabled:focus:border-dark disabled:focus:border-opacity-30 dark:hover:border-yellow dark:focus:border-yellow"
                    title={propType.desc}
                  >
                    <div class="mr-5 transition-all duration-200 min-w-max group-hover:text-green group-focus:text-green dark:text-light dark:group-hover:text-yellow dark:group-focus:text-yellow">
                      {propType.name}
                    </div>
                    <div class="overflow-hidden text-opacity-50 text-grey whitespace-nowrap overflow-ellipsis dark:text-light dark:text-opacity-50">
                      {propType.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {stage.value === 1 && (
                <div class="mb-4">
                  <BCMSTextInput
                    label={translations.value.modal.addProp.input.label.label}
                    placeholder={
                      translations.value.modal.addProp.input.label.placeholder
                    }
                    v-model={modalData.value.prop.label}
                    focusOnLoad
                    invalidText={modalData.value.errors.name}
                  />
                </div>
              )}
              {modalData.value.selected.type === BCMSPropType.ENUMERATION ? (
                <div class="mb-4">
                  <BCMSMultiAddInput
                    label={
                      translations.value.modal.addProp.input.enumeration.label
                    }
                    placeholder={
                      translations.value.modal.addProp.input.enumeration
                        .placeholder
                    }
                    value={[]}
                    invalidText={modalData.value.errors.enum}
                    format={enumLogic.format}
                    validate={enumLogic.validate}
                    onInput={enumLogic.addItems}
                    helperText={
                      translations.value.modal.addProp.input.enumeration
                        .helperText
                    }
                  />
                </div>
              ) : modalData.value.selected.type ===
                BCMSPropType.GROUP_POINTER ? (
                <div class="mb-4">
                  <BCMSGroupPointerSelect
                    selected={
                      (modalData.value.prop.defaultData as { _id: string })._id
                    }
                    invalidText={modalData.value.errors.groupPointer}
                    onChange={(data) => {
                      (
                        modalData.value.prop.defaultData as { _id: string }
                      )._id = data.value;
                    }}
                  />
                </div>
              ) : modalData.value.selected.type ===
                BCMSPropType.ENTRY_POINTER ? (
                <div class="mb-4">
                  <BCMSMultiSelect
                    label={
                      translations.value.modal.addProp.input.entryPointer.label
                    }
                    invalidText={modalData.value.errors.entryPointer}
                    items={templates.value.map((e) => {
                      const selected = !!(
                        modalData.value.prop
                          .defaultData as BCMSPropEntryPointerData[]
                      ).find((d) => d.templateId === e._id);
                      return {
                        id: e._id,
                        title: e.label,
                        selected,
                      };
                    })}
                    onChange={(items) => {
                      (modalData.value.prop
                        .defaultData as BCMSPropEntryPointerData[]) = items.map(
                        (item) => {
                          return {
                            templateId: item.id,
                            entryIds: [],
                            displayProp: 'title',
                          };
                        },
                      );
                    }}
                  />
                  {/*<BCMSEntryPointerSelect
                    selected={
                      (modalData.value.prop.defaultData as any).templateId
                    }
                    invalidText={modalData.value.errors.entryPointer}
                    onChange={(data) => {
                      (modalData.value.prop.defaultData as any).templateId =
                        data.value;
                    }}
                  />*/}
                </div>
              ) : (
                ''
              )}
              {stage.value === 1 && (
                <div
                  class={`${
                    (modalData.value.selected.type as BCMSPropType) !==
                    BCMSPropType.ENUMERATION
                      ? 'flex items-center space-x-10'
                      : ''
                  }`}
                >
                  <div class="mb-4">
                    <BCMSToggleInput
                      v-model={modalData.value.prop.required}
                      label={
                        translations.value.modal.addProp.input.required.label
                      }
                      states={
                        translations.value.modal.addProp.input.required.states
                      }
                    />
                  </div>
                  {(modalData.value.selected.type as BCMSPropType) !==
                    BCMSPropType.ENUMERATION && (
                    <div class="mb-4">
                      <BCMSToggleInput
                        v-model={modalData.value.prop.array}
                        label={
                          translations.value.modal.addProp.input.array.label
                        }
                        states={
                          translations.value.modal.addProp.input.array.states
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              {modalData.value.selected.type === BCMSPropType.COLOR_PICKER &&
              stage.value === 1 ? (
                <div>
                  <BCMSRadioInput
                    v-model={selectedColorPickerOption.value}
                    label={translations.value.input.color.label}
                    name="color-option"
                    options={[
                      {
                        label: translations.value.input.color.options[0],
                        value: 'pre-defined',
                      },
                      {
                        label: translations.value.input.color.options[1],
                        value: 'custom',
                      },
                      {
                        label: translations.value.input.color.options[2],
                        value: 'pre-defined-custom',
                      },
                    ]}
                  />
                </div>
              ) : (
                modalData.value.selected.type === BCMSPropType.COLOR_PICKER &&
                stage.value === 2 && (
                  <div class="mb-4">
                    <BCMSColorPickerInput
                      value={''}
                      allowCustom={true}
                      allowCreateColor={true}
                      allowCustomForce={true}
                      onChange={() => {
                        modalData.value.prop.defaultData =
                          getColorPickerOptions();
                      }}
                    />
                  </div>
                )
              )}
            </>
          )}
        </div>
      </Modal>
    );
  },
});
export default component;
