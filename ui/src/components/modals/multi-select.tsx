import { v4 as uuidv4 } from 'uuid';
import { search } from '@banez/search';
import { computed, defineComponent, ref } from 'vue';
import Modal from './_modal';
import type {
  BCMSModalInputDefaults,
  BCMSMultiSelectItem,
  BCMSMultiSelectItemExtended,
  BCMSMultiSelectModalInputData,
  BCMSMultiSelectModalOutputData,
} from '../../types';
import { BCMSTextInput } from '../input';
import BCMSImage from '../image';
import { useTranslation } from '../../translations';

interface Data extends BCMSModalInputDefaults<BCMSMultiSelectModalOutputData> {
  onlyOne: boolean;
  items: BCMSMultiSelectItemExtended[];
}

const component = defineComponent({
  setup() {
    const inputId = uuidv4();
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const modalData = ref<Data>(getData());
    const searchTerm = ref('');
    const store = window.bcms.vue.store;
    const items = computed<BCMSMultiSelectItemExtended[]>(() =>
      modalData.value.items.map((item) => {
        if (item.imageId) {
          item.image = store.getters.media_findOne(
            (e) => e._id === item.imageId
          );
        }
        return item;
      })
    );
    const filteredItems = computed<BCMSMultiSelectItemExtended[]>(() => {
      let output: BCMSMultiSelectItemExtended[] = JSON.parse(
        JSON.stringify(items.value)
      );
      if (searchTerm.value) {
        const result = search({
          searchTerm: searchTerm.value,
          set: modalData.value.items.map((item) => {
            return {
              id: item.id,
              data: [
                item.title.toLowerCase(),
                item.subtitle?.toLowerCase() || '_________',
                item.image ? item.image.name : '_________',
              ],
            };
          }),
        });
        output = result.items.map((e) => {
          return items.value.find((t) => t.id === e.id) as BCMSMultiSelectItem;
        });
      }
      output.sort((a, b) => {
        if (b.title > a.title) {
          return -1;
        }
        if (b.title < a.title) {
          return 1;
        }
        return 0;
      });
      return output;
    });

    window.bcms.modal.multiSelect = {
      hide() {
        show.value = false;
      },
      show(data) {
        setTimeout(() => {
          const el = document.getElementById(inputId);
          if (el) {
            el.focus();
          }
        }, 20);
        modalData.value = getData(data);
        show.value = true;
      },
    };

    function getData(inputData?: BCMSMultiSelectModalInputData): Data {
      const d: Data = {
        title: translations.value.modal.multiSelect.title,
        items: [],
        onlyOne: false,
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
        if (inputData.onlyOne) {
          d.onlyOne = inputData.onlyOne;
        }
        d.items = inputData.items;
      }
      return d;
    }

    function flush() {
      searchTerm.value = '';
    }

    function cancel() {
      flush();
      if (modalData.value.onCancel) {
        const result = modalData.value.onCancel();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.multiSelect.hide();
    }
    function done() {
      flush();
      if (modalData.value.onDone) {
        const result = modalData.value.onDone({
          items: modalData.value.items.filter((e) => e.selected),
        });
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.multiSelect.hide();
    }

    return () => {
      return (
        <Modal
          title={modalData.value.title}
          show={show.value}
          actionName="Done"
          onDone={done}
          onCancel={cancel}
        >
          <div class="flex flex-col overflow-hidden -ml-2.5 py-2.5 w-[calc(100%+20px)]">
            <BCMSTextInput
              id={inputId}
              placeholder="Search"
              onInput={(value) => {
                searchTerm.value = value.toLowerCase();
              }}
            />

            <div class="grid gap-2 py-3 overflow-y-auto">
              {filteredItems.value.map((item) => (
                <button
                  id={item.id}
                  class={`select-none mx-[5px] w-[calc(100%-10px)] rounded-3.5 border-none shadow relative text-left py-5 md:py-[15px] grid grid-cols-[1fr,auto] gap-y-1 gap-x-5 px-2.5 hover:shadow-inputHover transition-all ${
                    item.selected
                      ? 'bcmsModalMultiSelect--item_selected bg-green text-white dark:bg-yellow dark:text-dark'
                      : 'bg-light hover:bg-light dark:hover:bg-dark dark:hover:bg-opacity-20 dark:bg-grey'
                  }`}
                  onClick={() => {
                    for (let i = 0; i < modalData.value.items.length; i++) {
                      const target = modalData.value.items[i];
                      if (target.id === item.id) {
                        target.selected = !target.selected;
                        if (modalData.value.onlyOne) {
                          modalData.value.items = modalData.value.items.map(
                            (e) => {
                              if (e.id !== target.id) {
                                e.selected = false;
                              }
                              return e;
                            }
                          );
                        }
                        break;
                      }
                    }
                  }}
                >
                  <div
                    class={`text-base leading-tight -tracking-0.01 col-start-1 truncate text-dark dark:text-light ${
                      item.selected ? 'text-light dark:text-dark' : ''
                    }`}
                  >
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div
                      class={`text-base leading-tight -tracking-0.01 col-start-1 row-start-2 ${
                        item.selected
                          ? 'text-light dark:text-darkGrey'
                          : 'text-grey dark:text-light dark:text-opacity-80'
                      }`}
                    >
                      {item.subtitle}
                    </div>
                  )}
                  {item.image ? (
                    <div class="bcmsMultiSelect--item-image w-20 h-20 overflow-hidden rounded-2.5 row-start-1 row-end-3 relative">
                      <BCMSImage
                        class="absolute w-full h-full t-0 l-0 object-cover"
                        media={item.image}
                        alt={item.title}
                      />
                    </div>
                  ) : (
                    ''
                  )}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      );
    };
  },
});
export default component;
