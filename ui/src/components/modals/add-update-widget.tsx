import { computed, defineComponent, ref } from 'vue';
import type {
  BCMSAddUpdateWidgetModalInputData,
  BCMSAddUpdateWidgetModalOutputData,
  BCMSModalInputDefaults,
} from '../../types';
import Modal from './_modal';
import { BCMSMarkdownInput, BCMSMediaInput, BCMSTextInput } from '../input';
import { useTranslation } from '../../translations';

interface Data
  extends BCMSModalInputDefaults<BCMSAddUpdateWidgetModalOutputData> {
  label: string;
  originalLabel: string;
  mode: 'add' | 'update';
  desc: string;
  names: string[];
  previewImage: string;
  errors: {
    label: string;
    desc: string;
  };
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref(getData());

    window.bcms.modal.addUpdate.widget = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSAddUpdateWidgetModalInputData) {
      const d: Data = {
        title: translations.value.modal.addUpdateWidget.title,
        label: '',
        originalLabel: '',
        desc: '',
        mode: 'add',
        names: [],
        previewImage: '',
        errors: {
          label: '',
          desc: '',
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
        if (inputData.label) {
          d.label = inputData.label;
          d.originalLabel = inputData.label;
        }
        if (inputData.desc) {
          d.desc = inputData.desc;
        }
        if (inputData.previewImage) {
          d.previewImage = inputData.previewImage;
        }
        d.mode = inputData.mode;
        d.names = inputData.widgetNames;
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
      window.bcms.modal.addUpdate.widget.hide();
    }
    function done() {
      if (modalData.value.label.replace(/ /g, '') === '') {
        modalData.value.errors.label =
          translations.value.modal.addUpdateWidget.error.emptyLabel;
        return;
      } else if (
        (modalData.value.mode === 'add' &&
          modalData.value.names.includes(
            window.bcms.util.string.toSlugUnderscore(modalData.value.label)
          )) ||
        (modalData.value.originalLabel !== modalData.value.label &&
          modalData.value.names.includes(
            window.bcms.util.string.toSlugUnderscore(modalData.value.label)
          ))
      ) {
        modalData.value.errors.label =
          translations.value.modal.addUpdateWidget.error.duplicateLabel({
            label: modalData.value.label,
          });
        return;
      }
      modalData.value.errors.label = '';
      if (modalData.value.onDone) {
        const result = modalData.value.onDone({
          label: modalData.value.label,
          desc: modalData.value.desc,
          previewImage: modalData.value.previewImage,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.addUpdate.widget.hide();
    }

    return () => (
      <Modal
        class="editWidgetModal"
        title={modalData.value.title}
        onCancel={cancel}
        onDone={done}
        show={show.value}
      >
        <div class="mb-4">
          <BCMSTextInput
            label={translations.value.modal.addUpdateWidget.input.label.label}
            placeholder={
              translations.value.modal.addUpdateWidget.input.label.placeholder
            }
            invalidText={modalData.value.errors.label}
            v-model={modalData.value.label}
            focusOnLoad
          />
        </div>
        <div class="mb-4">
          <BCMSMarkdownInput
            label={
              translations.value.modal.addUpdateWidget.input.description.label
            }
            placeholder={
              translations.value.modal.addUpdateWidget.input.description
                .placeholder
            }
            invalidText={modalData.value.errors.desc}
            v-model={modalData.value.desc}
            helperText={
              translations.value.modal.addUpdateWidget.input.description
                .helperText
            }
          />
        </div>
        <div class="mb-4">
          <label>
            <span class="font-normal not-italic text-xs leading-normal tracking-0.06 uppercase select-none mb-1.25 block dark:text-light">
              {
                translations.value.modal.addUpdateWidget.input.previewImage
                  .title
              }
            </span>
          </label>
          <BCMSMediaInput
            id="previewImage"
            value={{ _id: modalData.value.previewImage }}
            showCaption={false}
            showAlt={false}
            onClear={() => {
              modalData.value.previewImage = '';
            }}
            onClick={() => {
              window.bcms.modal.media.picker.show({
                async onDone(data) {
                  modalData.value.previewImage = data.media._id;
                },
              });
            }}
          />
        </div>
      </Modal>
    );
  },
});
export default component;
