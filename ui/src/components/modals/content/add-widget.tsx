import { computed, defineComponent, ref } from 'vue';
import Modal from '../_modal';
import type {
  BCMSContentEditorAddWidgetModalInputData,
  BCMSContentEditorAddWidgetModalOutputData,
  BCMSModalInputDefaults,
} from '../../../types';
import type { BCMSWidget } from '@becomes/cms-sdk/types';
import { BCMSSpinner } from '../../spinner';
import { useTranslation } from '../../../translations';

interface Data
  extends BCMSModalInputDefaults<BCMSContentEditorAddWidgetModalOutputData> {
  widget?: BCMSWidget;
  allowedIds?: string[];
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const show = ref(false);
    const modalData = ref<Data>(getData());
    const widgets = computed(() => {
      if (modalData.value.allowedIds) {
        return store.getters.widget_find(
          (e) => !!(modalData.value.allowedIds as string[]).includes(e._id)
        );
      }
      return store.getters.widget_items;
    });
    const showSpinner = ref(false);

    window.bcms.modal.content.widget = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
        showSpinner.value = true;
        throwable(
          async () => {
            await window.bcms.sdk.widget.getAll();
          },
          async () => {
            showSpinner.value = false;
          },
          async (error) => {
            showSpinner.value = false;
            window.bcms.notification.error((error as Error).message);
          }
        );
      },
    };

    function getData(
      inputData?: BCMSContentEditorAddWidgetModalInputData
    ): Data {
      const d: Data = {
        title: translations.value.modal.addWidget.title,
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
        if (inputData.onDone) {
          d.onDone = inputData.onDone;
        }
        if (inputData.onCancel) {
          d.onCancel = inputData.onCancel;
        }
        if (inputData.allowedIds) {
          d.allowedIds = inputData.allowedIds;
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
      window.bcms.modal.content.widget.hide();
    }
    function done() {
      if (!modalData.value.widget) {
        window.bcms.notification.warning(
          translations.value.modal.addWidget.notification.emptyWidget
        );
        return;
      }
      if (modalData.value.onDone) {
        const result = modalData.value.onDone({
          widget: modalData.value.widget,
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.content.widget.hide();
    }

    return () => {
      return (
        <>
          <Modal
            class="bcmsAddWidgetModal"
            title={modalData.value.title}
            show={show.value}
            actionName={translations.value.modal.addWidget.actionName}
            onDone={done}
            onCancel={cancel}
          >
            <div class="bcmsAddWidgetModal--items">
              {widgets.value.map((widget) => {
                return (
                  <>
                    <button
                      class={`bcmsAddWidgetModal--item${
                        modalData.value.widget &&
                        modalData.value.widget._id === widget._id
                          ? ' bcmsAddWidgetModal--item_selected'
                          : ''
                      }`}
                      onClick={() => {
                        modalData.value.widget = widget;
                      }}
                    >
                      {widget.label}
                    </button>
                    <br />
                  </>
                );
              })}
            </div>
          </Modal>
          <BCMSSpinner
            show={showSpinner.value}
            message={translations.value.modal.addWidget.spinnerMessage}
          />
        </>
      );
    };
  },
});
export default component;
