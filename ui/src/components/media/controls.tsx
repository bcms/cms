import {
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  ref,
  Transition,
} from 'vue';
import { BCMSMediaType } from '@becomes/cms-sdk/types';
import { DefaultComponentProps } from '../_default';
import type { BCMSMediaControlFilters } from '../../types';
import BCMSIcon from '../icon';
import BCMSButton from '../button';
import { BCMSSelect, BCMSDateInput } from '../input';
import { useRoute } from 'vue-router';
import { useTranslation } from '../../translations';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
    disableUploadFile: Boolean,
    disableCreateFolder: Boolean,
  },
  emits: {
    uploadFile: () => {
      return true;
    },
    createFolder: () => {
      return true;
    },
    filter: (_filters: BCMSMediaControlFilters) => {
      return true;
    },
  },
  setup(props, ctx) {
    const translations = computed(() => {
      return useTranslation();
    });
    const route = useRoute();
    const filters = ref<BCMSMediaControlFilters>(getFilters());
    const query = computed(() => {
      return {
        search: route.query.search as string,
      };
    });
    let searchDebounceTimer: any;
    let searchQueryBuffer = '';

    function getFilters(): BCMSMediaControlFilters {
      return {
        search: {
          name: '',
        },
        isOpen: false,
        options: [
          {
            label: translations.value.page.media.filters.type.label,
            dropdown: {
              items: [
                {
                  label: translations.value.page.media.filters.type.image,
                  value: BCMSMediaType.IMG,
                },
                {
                  label: translations.value.page.media.filters.type.video,
                  value: BCMSMediaType.VID,
                },
                {
                  label: translations.value.page.media.filters.type.directory,
                  value: BCMSMediaType.DIR,
                },
              ],
              selected: {
                label: translations.value.page.media.filters.type.placeholder,
                value: '',
              },
            },
          },
          {
            label: translations.value.page.media.filters.dateModified.label,
            date: {
              year: -1,
              month: -1,
              day: -1,
            },
          },
        ],
        clear: () => {
          filters.value = getFilters();
          return filters.value;
        },
      };
    }

    onMounted(() => {
      if (query.value.search && route.path.startsWith('/dashboard/media')) {
        searchQueryBuffer = query.value.search;
        filters.value.search.name = query.value.search;
        ctx.emit('filter', filters.value);
      }
    });
    onBeforeUpdate(() => {
      if (searchQueryBuffer !== query.value.search) {
        searchQueryBuffer = query.value.search;
        filters.value.search.name = query.value.search;
        ctx.emit('filter', filters.value);
      }
    });

    return () => (
      <header
        key={query.value.search}
        class="flex flex-wrap justify-between mb-15"
      >
        <div class="relative flex border-b border-dark transition-colors duration-300 mb-5 w-full max-w-[500px] min-w-[250px] hover:border-green focus-within:border-green sm:mr-5 dark:border-light dark:hover:border-yellow dark:focus-within:border-yellow">
          <BCMSIcon
            class="absolute top-1/2 left-0 -translate-y-1/2 w-[18px] mr-2.5 text-dark fill-current dark:text-light"
            src="/search"
          />
          <input
            class="w-full py-2.5 pl-[35px] text-base outline-none bg-transparent dark:text-light"
            type="text"
            placeholder={translations.value.page.media.search.placeholder}
            v-model={filters.value.search.name}
            onKeyup={async () => {
              clearTimeout(searchDebounceTimer);
              searchDebounceTimer = setTimeout(() => {
                ctx.emit('filter', filters.value);
              }, 300);
            }}
          />
          <button
            v-cy={'open-filters'}
            onClick={() => {
              filters.value.isOpen = !filters.value.isOpen;
            }}
            class="group relative flex p-2 focus:outline-none"
          >
            <div
              class={`flex transition-transform duration-300 ${
                filters.value.isOpen ? 'rotate-180' : ''
              }`}
            >
              <BCMSIcon
                src="/chevron/down"
                class="relative m-auto top-0 w-[15px] h-2.5 translate-y-0 transition-all duration-300 pointer-events-none text-dark fill-current group-hover:text-green group-focus-visible:text-green dark:text-white dark:group-hover:text-yellow dark:group-focus-visible:text-yellow"
              />
            </div>
          </button>
          <Transition name="fade">
            {filters.value.isOpen ? (
              <div
                class="bg-white shadow-cardLg rounded-2.5 absolute w-full top-[120%] z-100 p-5 dark:bg-darkGrey"
                v-clickOutside={() => (filters.value.isOpen = false)}
              >
                {filters.value.options.map((filterOption) => {
                  return (
                    <div class="mb-[15px]">
                      {filterOption.dropdown ? (
                        <BCMSSelect
                          cyTag="mediaFilter"
                          placeholder={
                            translations.value.page.media.filters.type
                              .placeholder
                          }
                          label={filterOption.label}
                          options={filterOption.dropdown.items}
                          selected={filterOption.dropdown.selected.value}
                          onChange={async (option) => {
                            if (filterOption.dropdown) {
                              filterOption.dropdown.selected = option;
                              ctx.emit('filter', filters.value);
                            }
                          }}
                        />
                      ) : filterOption.date ? (
                        <BCMSDateInput
                          label={filterOption.label}
                          value={
                            filterOption.date.year !== -1
                              ? new Date(
                                  `${filterOption.date.year}-${filterOption.date.month}-${filterOption.date.day}`
                                ).getTime()
                              : 0
                          }
                          onInput={async (value) => {
                            if (filterOption.date) {
                              if (value === 0) {
                                filterOption.date = {
                                  year: -1,
                                  month: -1,
                                  day: -1,
                                };
                              } else {
                                const date = new Date(value);
                                filterOption.date.year = date.getFullYear();
                                filterOption.date.month = date.getMonth() + 1;
                                filterOption.date.day = date.getDate();
                              }
                              ctx.emit('filter', filters.value);
                            }
                          }}
                        />
                      ) : (
                        ''
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              ''
            )}
          </Transition>
        </div>
        <div class="flex flex-col xs:block">
          <BCMSButton
            disabled={props.disableUploadFile}
            class="mr-5 mb-5 xs:mb-0"
            onClick={() => {
              ctx.emit('uploadFile');
            }}
          >
            {translations.value.page.media.actions.upload}
          </BCMSButton>
          <BCMSButton
            disabled={props.disableCreateFolder}
            kind="secondary"
            onClick={() => {
              ctx.emit('createFolder');
            }}
          >
            {translations.value.page.media.actions.createFolder}
          </BCMSButton>
        </div>
      </header>
    );
  },
});
export default component;
