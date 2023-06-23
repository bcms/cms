import { computed, defineComponent, ref } from 'vue';
import Modal from './_modal';
import type {
  BCMSConfirmModalInputData,
  BCMSConfirmModalOutputData,
  BCMSModalInputDefaults,
} from '../../types';
import { BCMSTextInput } from '../input';
import { useTranslation } from '../../translations';

interface Data extends BCMSModalInputDefaults<BCMSConfirmModalOutputData> {
  body: string;
  prompt?: {
    invalidText: string;
    input: string;
    verify: string;
  };
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.confirm = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSConfirmModalInputData): Data {
      const d: Data = {
        title: translations.value.modal.confirm.title,
        body: '',
        prompt: undefined,
        onCancel() {
          // ...
        },
        onDone() {
          // ...
        },
      };
      if (inputData) {
        if (inputData.title) {
          d.title = inputData.title;
        }
        if (inputData.prompt) {
          d.prompt = {
            invalidText: translations.value.modal.confirm.error.prompt({
              value: inputData.prompt,
            }),
            input: inputData.prompt,
            verify: '',
          };
        }
        if (inputData.body) {
          d.body = inputData.body;
        }
        if (inputData.onDone) {
          d.onDone = inputData.onDone;
        }
        if (inputData.onCancel) {
          d.onCancel = inputData.onCancel;
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
      window.bcms.modal.confirm.hide();
    }
    function done() {
      if (modalData.value.onDone) {
        const result = modalData.value.onDone();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.confirm.hide();
    }

    return () => {
      return (
        <Modal
          title={modalData.value.title}
          show={show.value}
          actionName={translations.value.modal.confirm.actionName}
          onDone={done}
          onCancel={cancel}
          confirmDisabledButton={
            modalData.value.prompt?.verify !== modalData.value.prompt?.input
          }
        >
          {modalData.value.body ? (
            <>
              <div class="text-red" v-html={modalData.value.body} />
              {modalData.value.prompt ? (
                <BCMSTextInput
                  class="mt-5"
                  label={translations.value.modal.confirm.input.label.label}
                  helperText={translations.value.modal.confirm.input.label.helperText(
                    {
                      label: modalData.value.prompt.input,
                    }
                  )}
                  v-model={modalData.value.prompt.verify}
                  placeholder={modalData.value.prompt.input}
                  focusOnLoad
                  onEnter={() => {
                    if (
                      modalData.value.prompt?.verify ===
                      modalData.value.prompt?.input
                    ) {
                      done();
                    }
                  }}
                />
              ) : (
                ''
              )}
            </>
          ) : (
            ''
          )}
        </Modal>
      );
    };
  },
});
export default component;
