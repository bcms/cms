import { computed, defineComponent, ref } from 'vue';
import type {
  BCMSModalInputDefaults,
  BCMSTemplateOrganizerCreateModalInputData,
  BCMSTemplateOrganizerCreateModalOutputData,
} from '../../../types';
import Modal from '../_modal';
import { BCMSTextInput } from '../../input';
import { useTranslation } from '../../../translations';

interface Data
  extends BCMSModalInputDefaults<BCMSTemplateOrganizerCreateModalOutputData> {
  name: {
    value: string;
    error: string;
  };
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.templateOrganizer.create = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(
      inputData?: BCMSTemplateOrganizerCreateModalInputData
    ): Data {
      const d: Data = {
        title: translations.value.modal.templateOrganizer.title,
        name: {
          value: '',
          error: '',
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
        if (inputData.name) {
          d.name.value = inputData.name;
        }
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
      window.bcms.modal.templateOrganizer.create.hide();
    }
    function done() {
      if (modalData.value.name.value.replace(/ /g, '') === '') {
        modalData.value.name.error =
          translations.value.modal.templateOrganizer.error.emptyLabel;
        return;
      }
      modalData.value.name.error = '';
      if (modalData.value.onDone) {
        const result = modalData.value.onDone({
          name: modalData.value.name.value,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.templateOrganizer.create.hide();
    }

    return () => {
      return (
        <Modal
          title={modalData.value.title}
          show={show.value}
          actionName={translations.value.modal.templateOrganizer.actionName}
          onDone={done}
          onCancel={cancel}
        >
          <BCMSTextInput
            value={modalData.value.name.value}
            invalidText={modalData.value.name.error}
            placeholder={
              translations.value.modal.templateOrganizer.input.label.placeholder
            }
            focusOnLoad
            onInput={(value) => {
              modalData.value.name.value = value;
            }}
            onEnter={done}
          />
        </Modal>
      );
    };
  },
});
export default component;
