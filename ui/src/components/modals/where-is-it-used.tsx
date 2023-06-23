import { computed, defineComponent, ref } from 'vue';
import Modal from './_modal';
import type {
  BCMSWhereIsItUsedModalInputData,
  BCMSWhereIsItUsedModalOutputData,
  BCMSModalInputDefaults,
  BCMSWhereIsItUsedItem,
} from '../../types';
import BCMSLink from '../link';
import BCMSIcon from '../icon';
import { useRouter } from 'vue-router';
import { useTranslation } from '../../translations';

interface Data
  extends BCMSModalInputDefaults<BCMSWhereIsItUsedModalOutputData> {
  colsVisible: {
    type: boolean;
    label: boolean;
    location: boolean;
  };
  items: BCMSWhereIsItUsedItem[];
}

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const router = useRouter();
    const show = ref(false);
    const modalData = ref<Data>(getData());

    window.bcms.modal.whereIsItUsed = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSWhereIsItUsedModalInputData): Data {
      const d: Data = {
        title: translations.value.modal.whereIsItUsed.title,
        items: [],
        colsVisible: {
          type: true,
          label: true,
          location: true,
        },
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
        if (inputData.colsVisible) {
          d.colsVisible = {
            type: !!inputData.colsVisible.type,
            label: !!inputData.colsVisible.label,
            location: !!inputData.colsVisible.location,
          };
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
      window.bcms.modal.whereIsItUsed.hide();
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
      window.bcms.modal.whereIsItUsed.hide();
    }

    return () => {
      return (
        <Modal
          title={modalData.value.title}
          show={show.value}
          onDone={done}
          onCancel={cancel}
        >
          {modalData.value.items.length > 0 ? (
            <ul class="list-none">
              <li class="bcmsModal_whereIsItUsed--list-item hidden grid-cols-1 gap-4 py-5 mb-0 border-b border-dark border-opacity-20 font-semibold items-center justify-between xs:grid xs:grid-cols-[100px,0.6fr,0.4fr] xs:border-grey xs:border-opacity-50 dark:text-light">
                {modalData.value.colsVisible.type ? (
                  <div class="whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {translations.value.modal.whereIsItUsed.table.columns.type}
                  </div>
                ) : (
                  ''
                )}
                {modalData.value.colsVisible.label ? (
                  <div class="mr-0 whitespace-nowrap overflow-hidden overflow-ellipsis xs:mr-2.5">
                    {translations.value.modal.whereIsItUsed.table.columns.label}
                  </div>
                ) : (
                  ''
                )}
                {modalData.value.colsVisible.location ? (
                  <div class="whitespace-nowrap overflow-hidden overflow-ellipsis">
                    {
                      translations.value.modal.whereIsItUsed.table.columns
                        .location
                    }
                  </div>
                ) : (
                  ''
                )}
              </li>
              {modalData.value.items.map((item) => {
                return (
                  <li
                    class={`bcmsModal_whereIsItUsed--list-item grid grid-cols-1 gap-4 py-5 mb-0 border-b border-dark border-opacity-20 items-center justify-between xs:grid-cols-[100px,0.6fr,0.4fr] xs:border-grey xs:border-opacity-50 dark:text-light ${
                      modalData.value.colsVisible.type ? '' : ''
                    }`}
                  >
                    {modalData.value.colsVisible.type ? (
                      <div
                        class="whitespace-nowrap overflow-hidden overflow-ellipsis before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:not-italic before:text-grey before:text-xs before:leading-tight xs:before:hidden"
                        data-column-name={
                          translations.value.modal.whereIsItUsed.table.columns
                            .type
                        }
                      >
                        {window.bcms.util.string.toPretty(item.type)}
                      </div>
                    ) : (
                      ''
                    )}
                    {modalData.value.colsVisible.label ? (
                      <div
                        class="mr-0 whitespace-nowrap overflow-hidden overflow-ellipsis before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:not-italic before:text-grey before:text-xs before:leading-tight xs:before:hidden xs:mr-2.5"
                        data-column-name={
                          translations.value.modal.whereIsItUsed.table.columns
                            .label
                        }
                        title={item.label}
                      >
                        {item.label}
                      </div>
                    ) : (
                      ''
                    )}
                    {modalData.value.colsVisible.location ? (
                      <div
                        class={`whitespace-nowrap overflow-hidden overflow-ellipsis before:content-[attr(data-column-name)] before:w-15 before:inline-block before:font-semibold before:not-italic before:text-grey before:text-xs before:leading-tight xs:before:hidden ${
                          modalData.value.colsVisible.type ? '' : 'col-span-2'
                        }`}
                        data-column-name={
                          translations.value.modal.whereIsItUsed.table.columns
                            .location
                        }
                      >
                        {item.type === 'entry' ? (
                          <BCMSLink
                            clickOverride={true}
                            onClick={(event) => {
                              event.preventDefault();
                              cancel();
                              router.push(
                                '/' +
                                  (event.currentTarget as HTMLLinkElement).href
                                    .split('/')
                                    .slice(3)
                                    .join('/')
                              );
                            }}
                            href={`/dashboard/t/${item.template?.id}/e/${item.id}`}
                            class="inline-flex text-green font-semibold no-underline items-center hover:underline focus:underline xs:flex dark:text-yellow"
                          >
                            <span class="truncate">
                              {item.linkText ||
                                translations.value.modal.whereIsItUsed.table
                                  .openCta}
                            </span>
                            <BCMSIcon
                              src="/link"
                              class="w-5 text-green fill-current ml-2.5 dark:text-yellow"
                            />
                          </BCMSLink>
                        ) : item.type === 'widget' ? (
                          <BCMSLink
                            clickOverride={true}
                            onClick={(event) => {
                              event.preventDefault();
                              cancel();
                              router.push(
                                '/' +
                                  (event.currentTarget as HTMLLinkElement).href
                                    .split('/')
                                    .slice(3)
                                    .join('/')
                              );
                            }}
                            href={`/dashboard/w/${item.id}`}
                            class="inline-flex text-green font-semibold no-underline items-center hover:underline focus:underline xs:flex dark:text-yellow"
                          >
                            <span>
                              {
                                translations.value.modal.whereIsItUsed.table
                                  .openCta
                              }
                            </span>
                            <BCMSIcon
                              src="/link"
                              class="w-5 text-green fill-current ml-2.5 dark:text-yellow"
                            />
                          </BCMSLink>
                        ) : item.type === 'group' ? (
                          <BCMSLink
                            clickOverride={true}
                            onClick={(event) => {
                              event.preventDefault();
                              cancel();
                              router.push(
                                '/' +
                                  (event.currentTarget as HTMLLinkElement).href
                                    .split('/')
                                    .slice(3)
                                    .join('/')
                              );
                            }}
                            href={`/dashboard/g/${item.id}`}
                            class="inline-flex text-green font-semibold no-underline items-center hover:underline focus:underline xs:flex dark:text-yellow"
                          >
                            <span>
                              {
                                translations.value.modal.whereIsItUsed.table
                                  .openCta
                              }
                            </span>
                            <BCMSIcon
                              src="/link"
                              class="w-5 text-green fill-current ml-2.5 dark:text-yellow"
                            />
                          </BCMSLink>
                        ) : item.type === 'template' ? (
                          <BCMSLink
                            clickOverride={true}
                            onClick={(event) => {
                              event.preventDefault();
                              cancel();
                              router.push(
                                '/' +
                                  (event.currentTarget as HTMLLinkElement).href
                                    .split('/')
                                    .slice(3)
                                    .join('/')
                              );
                            }}
                            href={`/dashboard/t/${item.id}`}
                            class="inline-flex text-green font-semibold no-underline items-center hover:underline focus:underline xs:flex dark:text-yellow"
                          >
                            <span>
                              {
                                translations.value.modal.whereIsItUsed.table
                                  .openCta
                              }
                            </span>
                            <BCMSIcon
                              src="/link"
                              class="w-5 text-green fill-current ml-2.5 dark:text-yellow"
                            />
                          </BCMSLink>
                        ) : (
                          ''
                        )}
                      </div>
                    ) : (
                      ''
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div class="text-grey text-2xl">
              {translations.value.modal.whereIsItUsed.empty}
            </div>
          )}
        </Modal>
      );
    };
  },
});
export default component;
