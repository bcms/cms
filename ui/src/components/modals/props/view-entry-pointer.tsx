import { computed, defineComponent, ref } from 'vue';
import Modal from '../_modal';
import type {
  BCMSModalInputDefaults,
  BCMSViewEntryPointerModalInputData,
  BCMSViewEntryPointerModalOutputData,
} from '../../../types';
import { useTranslation } from '../../../translations';
import { BCMSIcon, BCMSLink } from '../..';

interface Data
  extends BCMSModalInputDefaults<BCMSViewEntryPointerModalOutputData> {
  items: Array<{
    label: string;
    uri: string;
  }>;
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref(getData());

    window.bcms.modal.props.viewEntryPointer = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSViewEntryPointerModalInputData) {
      const d: Data = {
        title: '',
        items: [],
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
        d.items = inputData.items;
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
      window.bcms.modal.props.viewEntryPointer.hide();
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
      window.bcms.modal.props.viewEntryPointer.hide();
    }

    return () => (
      <Modal
        title={modalData.value.title}
        show={show.value}
        actionName={translations.value.modal.editProp.actionName}
        onDone={done}
        onCancel={cancel}
        doNotShowFooter={true}
      >
        <div class="inline-flex flex-wrap gap-3 mb-8">
          {modalData.value.items.map((item) => {
            return (
              <BCMSLink
                href={item.uri}
                tooltip="Entry Pointer"
                class="inline-flex items-center rounded-2.5 bg-light px-3 py-1.5 font-semibold no-underline text-green hover:underline focus-visible:underline dark:text-yellow dark:bg-dark/20"
                onClick={() => {
                  cancel();
                }}
              >
                <BCMSIcon
                  src="/link"
                  class="w-5 h-5 mr-2 fill-current text-green dark:text-yellow"
                />
                <span class="truncate">{item.label}</span>
              </BCMSLink>
            );
          })}
        </div>
      </Modal>
    );
  },
});
export default component;
