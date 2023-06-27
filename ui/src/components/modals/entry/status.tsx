import { computed, defineComponent, ref } from 'vue';
import type {
  BCMSEntryStatusModalInputData,
  BCMSEntryStatusModalOutputData,
  BCMSModalInputDefaults,
  BCMSStatusUpdateData,
} from '../../../types';
import Modal from '../_modal';
import { BCMSMultiAddInput } from '../../input';
import { useTranslation } from '../../../translations';

interface Data extends BCMSModalInputDefaults<BCMSEntryStatusModalOutputData> {
  updates: BCMSStatusUpdateData[];
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const show = ref(false);
    const modalData = ref(getData());
    const startingStatusSet = computed(() => {
      return store.getters.status_find(
        (e) => e.name !== 'active' && e.name !== 'draft'
      );
    });
    const statuses = ref<string[]>([]);

    window.bcms.modal.entry.status = {
      hide() {
        show.value = false;
      },
      show(data) {
        if (startingStatusSet.value.length === 0) {
          throwable(
            async () => {
              return await window.bcms.sdk.status.getAll();
            },
            async () => {
              statuses.value = startingStatusSet.value.map((e) => e.label);
              modalData.value = getData(data);
              show.value = true;
            }
          );
        } else {
          statuses.value = startingStatusSet.value.map((e) => e.label);
          modalData.value = getData(data);
          show.value = true;
        }
      },
    };

    function getData(inputData?: BCMSEntryStatusModalInputData): Data {
      const d: Data = {
        title: translations.value.modal.entryStatus.title,
        updates: [],
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
      window.bcms.modal.entry.status.hide();
    }
    function done() {
      window.bcms
        .confirm(
          translations.value.modal.entryStatus.confirm.done.title,
          translations.value.modal.entryStatus.confirm.done.description
        )
        .then((yes) => {
          if (yes) {
            if (modalData.value.onDone) {
              const result = modalData.value.onDone({
                updates: modalData.value.updates,
              });
              if (result instanceof Promise) {
                result.catch((error) => {
                  console.error(error);
                });
              }
            }
            window.bcms.modal.entry.status.hide();
          }
        });
    }
    function doUpdate(items: string[]) {
      if (items.length > statuses.value.length) {
        modalData.value.updates = modalData.value.updates.filter(
          (e) => e.label !== items[items.length - 1]
        );
        const statusExist = startingStatusSet.value.find(
          (e) => e.label === items[items.length - 1]
        );
        if (!statusExist) {
          modalData.value.updates.push({
            label: items[items.length - 1],
            color: '',
            type: 'create',
          });
        }
        statuses.value.push(items[items.length - 1]);
      } else {
        for (let i = 0; i < statuses.value.length; i++) {
          if (items[i] !== statuses.value[i]) {
            modalData.value.updates = modalData.value.updates.filter(
              (e) => e.label !== statuses.value[i]
            );
            const statusToRemove = startingStatusSet.value.find(
              (e) => e.label === statuses.value[i]
            );
            if (statusToRemove) {
              modalData.value.updates.push({
                _id: statusToRemove._id,
                label: statusToRemove.label,
                color: '',
                type: 'remove',
              });
            }
            statuses.value.splice(i, 1);
            break;
          }
        }
      }
    }

    return () => (
      <Modal
        title={modalData.value.title}
        onCancel={cancel}
        onDone={done}
        show={show.value}
      >
        <BCMSMultiAddInput
          label={translations.value.modal.entryStatus.input.enumeration.label}
          placeholder={
            translations.value.modal.entryStatus.input.enumeration.placeholder
          }
          value={statuses.value}
          focusOnLoad
          validate={(items) => {
            if (
              items
                .splice(0, items.length - 1)
                .includes(items[items.length - 1])
            ) {
              return translations.value.modal.entryStatus.error.duplicateEnumeration(
                {
                  label: items[items.length - 1],
                }
              );
            }
            return null;
          }}
          onInput={(data) => {
            doUpdate(data);
          }}
        />
      </Modal>
    );
  },
});
export default component;
