import { computed, defineComponent, ref } from 'vue';
import type {
  BCMSAddUpdateDirModalInputData,
  BCMSAddUpdateDirModalOutputData,
  BCMSModalInputDefaults,
} from '../../../types';
import Modal from '../_modal';
import { BCMSTextInput } from '../../input';
import { useTranslation } from '../../../translations';

interface Data extends BCMSModalInputDefaults<BCMSAddUpdateDirModalOutputData> {
  name: string;
  takenNames: string[];
  mode: 'add' | 'update';
  errors: {
    name: string;
  };
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref(getData());

    window.bcms.modal.media.addUpdateDir = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSAddUpdateDirModalInputData): Data {
      const d: Data = {
        title: translations.value.modal.addUpdateDirectory.title,
        name: '',
        takenNames: [],
        mode: 'add',
        errors: {
          name: '',
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
          d.name = inputData.name;
        }
        d.mode = inputData.mode;
        d.takenNames = inputData.takenNames;
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
      window.bcms.modal.media.addUpdateDir.hide();
    }
    function done() {
      if (modalData.value.name === '') {
        modalData.value.errors.name =
          translations.value.modal.addUpdateDirectory.error.emptyLabel;
        return;
      } else if (
        modalData.value.mode === 'add' &&
        modalData.value.takenNames.includes(modalData.value.name)
      ) {
        modalData.value.errors.name =
          translations.value.modal.addUpdateDirectory.error.duplicateFolder({
            label: modalData.value.name,
          });
        return;
      }
      modalData.value.errors.name = '';
      if (modalData.value.onDone) {
        const result = modalData.value.onDone({
          name: modalData.value.name,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.media.addUpdateDir.hide();
    }

    return () => (
      <Modal
        title={modalData.value.title}
        onCancel={cancel}
        onDone={done}
        show={show.value}
      >
        <div class="mb-4">
          <BCMSTextInput
            label={
              translations.value.modal.addUpdateDirectory.input.label.label
            }
            placeholder={
              translations.value.modal.addUpdateDirectory.input.label
                .placeholder
            }
            value={modalData.value.name}
            invalidText={modalData.value.errors.name}
            focusOnLoad
            onInput={(value) => {
              modalData.value.name = window.bcms.util.string.toSlug(value);
            }}
            onEnter={() => {
              done();
            }}
          />
        </div>
      </Modal>
    );
  },
});
export default component;
