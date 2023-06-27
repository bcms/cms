import { computed, defineComponent, ref } from 'vue';
import Modal from '../_modal';
import BCMSCodeEditor from '../../code-editor';
import type {
  BCMSModalInputDefaults,
  BCMSViewEntryModelModalInputData,
  BCMSViewEntryModelModalOutputData,
} from '../../../types';
import BCMSButton from '../../button';
import { useTranslation } from '../../../translations';

interface Data
  extends BCMSModalInputDefaults<BCMSViewEntryModelModalOutputData> {
  entryId: string;
  templateId: string;
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const show = ref(false);
    const code = ref('');
    const modalData = ref(getData());
    const type = ref<'original' | 'parsed'>('original');

    window.bcms.modal.entry.viewModel = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function parseEntry(entry: unknown): string {
      return JSON.stringify(entry, null, '  ');
    }
    function getData(inputData?: BCMSViewEntryModelModalInputData): Data {
      code.value = translations.value.modal.viewModel.empty;
      const d: Data = {
        title: translations.value.modal.viewModel.title,
        templateId: '',
        entryId: '',
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
        d.templateId = inputData.templateId;
        d.entryId = inputData.entryId;
        const entry = store.getters.entry_findOne((e) => e._id === d.entryId);
        if (entry) {
          code.value = parseEntry(entry);
        } else {
          throwable(
            async () => {
              return await window.bcms.sdk.entry.get({
                templateId: d.templateId,
                entryId: d.entryId,
              });
            },
            async (result) => {
              code.value = parseEntry(result);
            }
          ).catch((error) => {
            console.error(error);
          });
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
      window.bcms.modal.entry.viewModel.hide();
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
      window.bcms.modal.entry.viewModel.hide();
    }

    return () => (
      <Modal
        title={modalData.value.title}
        onCancel={cancel}
        onDone={done}
        show={show.value}
        class="bcmsModal_fullModel"
      >
        <div class="flex items-center space-x-2 px-5 py-3 -mt-3">
          <BCMSButton
            class={type.value === 'original' ? 'is-active' : ''}
            disabled={type.value === 'original'}
            kind="alternate"
            onClick={async () => {
              await throwable(
                async () => {
                  return await window.bcms.sdk.entry.get({
                    templateId: modalData.value.templateId,
                    entryId: modalData.value.entryId,
                  });
                },
                async (entry) => {
                  code.value = parseEntry(entry);
                  type.value = 'original';
                }
              );
            }}
          >
            {translations.value.modal.viewModel.original}
          </BCMSButton>
          <BCMSButton
            class={type.value === 'parsed' ? 'is-active' : ''}
            disabled={type.value === 'parsed'}
            kind="alternate"
            onClick={async () => {
              await throwable(
                async () => {
                  return await window.bcms.sdk.entry.getOneParsed({
                    templateId: modalData.value.templateId,
                    entryId: modalData.value.entryId,
                    skipCache: true,
                  });
                },
                async (entry) => {
                  code.value = parseEntry(entry);
                  type.value = 'parsed';
                }
              );
            }}
          >
            {translations.value.modal.viewModel.parsed}
          </BCMSButton>
        </div>
        <BCMSCodeEditor readOnly={true} code={code.value} />
      </Modal>
    );
  },
});
export default component;
