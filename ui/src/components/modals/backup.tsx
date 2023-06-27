import { computed, defineComponent, ref } from 'vue';
import Modal from './_modal';
import type {
  BCMSBackupModalInputData,
  BCMSBackupModalOutputData,
  BCMSModalInputDefaults,
} from '../../types';
import { BCMSButton, BCMSIcon } from '..';
import type { BCMSBackupListItem } from '@becomes/cms-sdk/types';
import { useTranslation } from '../../translations';

type Data = BCMSModalInputDefaults<BCMSBackupModalOutputData>;

const component = defineComponent({
  setup() {
    const throwable = window.bcms.util.throwable;
    const sdk = window.bcms.sdk;
    const show = ref(false);
    const store = window.bcms.vue.store;
    const translations = computed(() => {
      return useTranslation();
    });
    const modalData = ref<Data>(getData());
    const backups = computed(() => store.getters.backupItem_items);

    window.bcms.modal.backup = {
      hide() {
        show.value = false;
      },
      show(data) {
        throwable(async () => {
          await sdk.backup.list();
        });
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSBackupModalInputData): Data {
      const d: Data = {
        title: translations.value.modal.backups.title,
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
      window.bcms.modal.backup.hide();
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
      window.bcms.modal.backup.hide();
    }

    function getSize(size: number): string {
      if (size === -1) {
        return translations.value.modal.backups.inProcess;
      }
      let output = size / 1024;
      if (output < 1000) {
        return `${output.toFixed(2)}KB`;
      } else {
        output = output / 1000;
        if (output < 1000) {
          return `${output.toFixed(2)}MB`;
        } else {
          return `${(output / 1000).toFixed(2)}GB`;
        }
      }
    }

    async function downloadBackup(backup: BCMSBackupListItem) {
      await throwable(
        async () => {
          return await sdk.backup.getDownloadHash({ fileName: backup._id });
        },
        async (result) => {
          const el = document.createElement('a');
          el.setAttribute('href', `/api/backup/${result}`);
          el.setAttribute('download', backup._id);
          el.style.display = 'none';
          document.body.appendChild(el);
          el.click();
          document.body.removeChild(el);
        }
      );
    }

    async function deleteBackup(backup: BCMSBackupListItem) {
      await throwable(async () => {
        await sdk.backup.delete({ fileNames: [backup._id] });
      });
    }

    return () => {
      return (
        <Modal
          title={modalData.value.title}
          show={show.value}
          doNotShowFooter={true}
          onDone={done}
          onCancel={cancel}
        >
          <div class="pb-10">
            {backups.value.length > 0 ? (
              <ul>
                {backups.value.map((backup) => {
                  return (
                    <li class="flex gap-5 border-bottom border-red mb-5 dark:text-light">
                      <div>{backup._id}</div>
                      <div>{getSize(backup.size)}</div>
                      {backup.size > -1 && (
                        <>
                          <button
                            onClick={() => {
                              downloadBackup(backup);
                            }}
                            class="text-grey transition-colors duration-300 hover:text-dark focus-visible:text-dark dark:hover:text-light dark:focus-visible:text-light"
                          >
                            <BCMSIcon
                              class="w-6 h-6 fill-current"
                              src="/file"
                            />
                          </button>
                          <button
                            onClick={() => {
                              deleteBackup(backup);
                            }}
                            class="text-grey transition-colors duration-300 hover:text-red focus-visible:text-red"
                          >
                            <BCMSIcon
                              class="w-6 h-6 fill-current"
                              src="/trash"
                            />
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div class="mb-5 dark:text-light">
                {translations.value.modal.backups.empty}
              </div>
            )}
            <BCMSButton
              onClick={() => {
                throwable(async () => {
                  await sdk.backup.create({
                    media: true,
                  });
                });
              }}
            >
              {translations.value.modal.backups.action}
            </BCMSButton>
          </div>
        </Modal>
      );
    };
  },
});
export default component;
