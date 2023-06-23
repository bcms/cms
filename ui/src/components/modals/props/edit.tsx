import { computed, defineComponent, ref } from 'vue';
import type {
  BCMSProp,
  BCMSPropEnumData,
  BCMSPropEntryPointerData,
} from '@becomes/cms-sdk/types';
import { BCMSPropType } from '@becomes/cms-sdk/types';
import Modal from '../_modal';
import type {
  BCMSAddPropertyModalLocation,
  BCMSEditPropModalInputData,
  BCMSEditPropModalOutputData,
  BCMSModalInputDefaults,
} from '../../../types';
import {
  BCMSTextInput,
  BCMSMultiAddInput,
  BCMSToggleInput,
  BCMSMultiSelect,
  BCMSRadioInput,
  BCMSColorPickerInput,
} from '../../input';
import { useTranslation } from '../../../translations';
import type { BCMSPropColorPickerData } from '@becomes/cms-sdk/types/models/prop/color-picker';

interface Data extends BCMSModalInputDefaults<BCMSEditPropModalOutputData> {
  prop: BCMSProp;
  takenPropNames: string[];
  location: BCMSAddPropertyModalLocation;
  entityId: string;
  errors: {
    label: string;
    enum: string;
    entryPointer: string;
  };
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref(getData());
    const store = window.bcms.vue.store;
    const templates = computed(() => store.getters.template_items);
    const selectedColorPickerOption = ref<
      'pre-defined' | 'custom' | 'pre-defined-custom'
    >('pre-defined');
    const stage = ref(1);
    const colorPropId = ref('');

    window.bcms.modal.props.edit = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSEditPropModalInputData) {
      const d: Data = {
        title: translations.value.modal.editProp.title({
          label: '',
        }),
        location: 'template',
        entityId: '',
        prop: {
          id: '',
          label: '',
          required: false,
          name: '',
          defaultData: [''],
          type: BCMSPropType.STRING,
          array: false,
        },
        takenPropNames: [],
        errors: {
          label: '',
          enum: '',
          entryPointer: '',
        },
      };
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
        d.prop = JSON.parse(JSON.stringify(inputData.prop));
        d.takenPropNames = inputData.takenPropNames;
        d.location = inputData.location;
        d.entityId = inputData.entityId;
        stage.value = 1;
        selectedColorPickerOption.value =
          (inputData.prop.defaultData as BCMSPropColorPickerData).allowGlobal &&
          !(inputData.prop.defaultData as BCMSPropColorPickerData).allowCustom
            ? 'pre-defined'
            : (inputData.prop.defaultData as BCMSPropColorPickerData)
                .allowCustom &&
              !(inputData.prop.defaultData as BCMSPropColorPickerData)
                .allowGlobal
            ? 'custom'
            : 'pre-defined-custom';
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
      window.bcms.modal.props.edit.hide();
    }
    async function done() {
      if (modalData.value.prop.label.replace(/ /g, '') === '') {
        modalData.value.errors.label =
          translations.value.modal.editProp.error.emptyLabel;
        return;
      } else if (
        modalData.value.takenPropNames.includes(
          window.bcms.util.string.toSlugUnderscore(modalData.value.prop.label),
        )
      ) {
        modalData.value.errors.label =
          translations.value.modal.editProp.error.duplicateLabel;
        return;
      }
      modalData.value.errors.label = '';
      if (
        modalData.value.prop.type === BCMSPropType.ENUMERATION &&
        (modalData.value.prop.defaultData as BCMSPropEnumData).items.length ===
          0
      ) {
        modalData.value.errors.enum =
          translations.value.modal.editProp.error.emptyEnumeration;
        return;
      }
      if (
        modalData.value.prop.type === BCMSPropType.ENTRY_POINTER &&
        (modalData.value.prop.defaultData as BCMSPropEntryPointerData[])
          .length === 0
      ) {
        modalData.value.errors.entryPointer =
          translations.value.modal.editProp.error.emptyEntryPointer;
        return;
      }
      modalData.value.errors.enum = '';
      if (modalData.value.prop.type === BCMSPropType.COLOR_PICKER) {
        if (stage.value === 1) {
          stage.value++;
          return;
        } else if (stage.value === 2) {
          await window.bcms.util.throwable(
            async () => {
              return await window.bcms.sdk[modalData.value.location].update({
                _id: modalData.value.entityId,
                propChanges: [
                  {
                    update: {
                      label: modalData.value.prop.label,
                      required: modalData.value.prop.required,
                      array: modalData.value.prop.array,
                      colorData: getColorPickerOptions(),
                      id: modalData.value.prop.id,
                      move: 0,
                    },
                  },
                ],
              });
            },
            async (entity) => {
              const colorProp = entity.props[entity.props.length - 1];
              colorPropId.value = colorProp.id;
            },
          );
        }
      }
      if (modalData.value.onDone) {
        const result = modalData.value.onDone({
          prop: modalData.value.prop,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.props.edit.hide();
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

    return () => (
      <Modal
        title={modalData.value.title}
        show={show.value}
        actionName={
          modalData.value.prop.type === BCMSPropType.COLOR_PICKER &&
          stage.value === 1
            ? translations.value.modal.editProp.actionName2
            : translations.value.modal.editProp.actionName
        }
        onDone={done}
        onCancel={cancel}
      >
        {(modalData.value.prop.type === BCMSPropType.COLOR_PICKER
          ? stage.value === 1
          : true) && (
          <div class="grid grid-cols-3 sm:grid-cols-4">
            <div class="mb-4 col-span-3 sm:col-span-4">
              <BCMSTextInput
                label={translations.value.modal.editProp.input.label.label}
                placeholder={
                  translations.value.modal.editProp.input.label.placeholder
                }
                invalidText={modalData.value.errors.label}
                v-model={modalData.value.prop.label}
                focusOnLoad
              />
            </div>
            {modalData.value.prop.type === BCMSPropType.ENUMERATION ? (
              <div class="mb-4 col-span-3 sm:col-span-4">
                <BCMSMultiAddInput
                  label={
                    translations.value.modal.editProp.input.enumeration.label
                  }
                  placeholder={
                    translations.value.modal.editProp.input.enumeration
                      .placeholder
                  }
                  value={
                    (modalData.value.prop.defaultData as BCMSPropEnumData).items
                  }
                  invalidText={modalData.value.errors.enum}
                  format={(value) => {
                    return window.bcms.util.string.toEnum(value);
                  }}
                  validate={(items) => {
                    if (
                      items
                        .splice(0, items.length - 1)
                        .includes(items[items.length - 1])
                    ) {
                      return translations.value.modal.editProp.error.duplicateEnumeration(
                        {
                          label: items[items.length - 1],
                        },
                      );
                    }
                    return null;
                  }}
                  onInput={(items) => {
                    (
                      modalData.value.prop.defaultData as BCMSPropEnumData
                    ).items = items;
                  }}
                />
              </div>
            ) : (
              <div class="mb-4">
                <BCMSToggleInput
                  v-model={modalData.value.prop.required}
                  label={translations.value.modal.editProp.input.required.label}
                  states={
                    translations.value.modal.editProp.input.required.states
                  }
                />
              </div>
            )}
            {modalData.value.prop.type !== BCMSPropType.GROUP_POINTER &&
              modalData.value.prop.type !== BCMSPropType.ENUMERATION && (
                <div class="mb-4">
                  <BCMSToggleInput
                    v-model={modalData.value.prop.array}
                    label={translations.value.modal.editProp.input.array.label}
                    states={
                      translations.value.modal.editProp.input.array.states
                    }
                  />
                </div>
              )}
          </div>
        )}
        {modalData.value.prop.type === BCMSPropType.ENTRY_POINTER ? (
          <div class="mb-4">
            <BCMSMultiSelect
              label={translations.value.modal.editProp.input.entryPointer.label}
              invalidText={modalData.value.errors.entryPointer}
              items={templates.value.map((e) => {
                const selected = !!(
                  modalData.value.prop.defaultData as BCMSPropEntryPointerData[]
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
          </div>
        ) : (
          ''
        )}
        {modalData.value.prop.type === BCMSPropType.COLOR_PICKER &&
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
          modalData.value.prop.type === BCMSPropType.COLOR_PICKER &&
          stage.value === 2 && (
            <div class="mb-4">
              <BCMSColorPickerInput
                value={''}
                allowCustom={true}
                allowGlobal={true}
                allowCreateColor={true}
                allowCustomForce={true}
                onChange={() => {
                  modalData.value.prop.defaultData = getColorPickerOptions();
                }}
              />
            </div>
          )
        )}
      </Modal>
    );
  },
});
export default component;
