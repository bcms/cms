import { gsap } from 'gsap';
import { ExpoScaleEase } from 'gsap/EasePack';
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  Transition,
} from 'vue';
import BCMSGlobalSearchList from './list';
import BCMSIcon from '../icon';
import type { BCMSGlobalSearchItem } from '../../types';
import { useTranslation } from '../../translations';

gsap.registerPlugin(ExpoScaleEase);

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const list = ref<HTMLUListElement | null>(null);
    const searchInput = ref<HTMLInputElement | null>(null);
    const searchValue = ref('');
    const searchResults = ref<BCMSGlobalSearchItem[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeout: any;
    window.bcms.globalSearch.show = () => {
      handleShowShortcut();
    };
    window.bcms.globalSearch.hide = () => {
      hide();
    };

    function handleShowShortcut(event?: KeyboardEvent) {
      if (!event || ((event.ctrlKey || event.metaKey) && event.key === 'k')) {
        event?.preventDefault();
        show.value = true;

        document.addEventListener('keydown', handleArrowsNavigation);

        nextTick(() => {
          if (searchInput.value) {
            searchInput.value.focus();
          }
        });
      }
    }

    function handleArrowsNavigation(event: KeyboardEvent) {
      const resultItems = Array.from(
        document.querySelectorAll('.globalSearch--result-item a'),
      ) as HTMLAnchorElement[];

      if (list.value && show.value) {
        const dropDown = {
          root: list.value,
          active: list.value.querySelector(
            '.globalSearch--result-item a:focus',
          ) as HTMLAnchorElement,
          firstItem: resultItems[0] as HTMLAnchorElement,
          lastItem: resultItems[resultItems.length - 1] as HTMLAnchorElement,
        };

        const activeIndex = resultItems.indexOf(dropDown.active);

        switch (event.key) {
          case 'Escape': // 'ESC' - Hide
            event.preventDefault();
            hide();
            break;

          case 'ArrowUp': // 'ARROW UP' - Navigate up
            if (Object.keys(searchResults.value).length) {
              event.preventDefault();

              if (!dropDown.active || activeIndex === 0 || activeIndex === -1) {
                if (dropDown.lastItem) {
                  dropDown.lastItem.focus();
                }
              } else {
                resultItems[activeIndex - 1].focus();
              }
            }
            break;

          case 'ArrowDown': // 'ARROW DOWN' - Navigate down
            if (Object.keys(searchResults.value).length > 0) {
              event.preventDefault();
              if (!dropDown.active || activeIndex === resultItems.length - 1) {
                if (dropDown.firstItem) {
                  dropDown.firstItem.focus();
                }
              } else {
                resultItems[activeIndex + 1].focus();
              }
            }
            break;

          default:
            break;
        }
      }
    }

    function hide() {
      show.value = false;
      searchValue.value = '';
      searchResults.value = [];
      document.removeEventListener('keydown', handleArrowsNavigation);
    }
    async function search() {
      await window.bcms.util.throwable(async () => {
        const searchItems = await window.bcms.sdk.search.global(
          searchValue.value.toLowerCase(),
        );
        const toFetch: {
          [type: string]: {
            [id: string]: string[];
          };
        } = {};
        for (let i = 0; i < searchItems.length; i++) {
          const result = searchItems[i];
          if (!toFetch[result.type]) {
            toFetch[result.type] = {};
          }
          if (result.type == 'entry') {
            const templateId = result.templateId as string;
            if (!toFetch[result.type][templateId]) {
              toFetch[result.type][templateId] = [];
            }
            toFetch[result.type][templateId].push(result.id);
          } else {
            toFetch[result.type][result.id] = [];
          }
        }
        searchResults.value = [];
        for (let i = 0; i < searchItems.length; i++) {
          const sItem = searchItems[i];
          switch (sItem.type) {
            case 'entry':
              {
                const template = await window.bcms.sdk.template.get(
                  sItem.templateId as string,
                );
                await window.bcms.sdk.entry.getAllLite({
                  templateId: template._id,
                });
                const item = await window.bcms.sdk.entry.getLite({
                  templateId: sItem.templateId as string,
                  entryId: sItem.id,
                });
                searchResults.value.push({
                  label: (item.meta[0].props[0].data as string[])[0],
                  url: `/dashboard/t/${template.cid}/e/${item.cid}`,
                  kind: 'Entry',
                });
              }
              break;
            case 'group':
              {
                const item = await window.bcms.sdk.group.get(sItem.id);
                searchResults.value.push({
                  label: item.label,
                  url: `/dashboard/g/${item.cid}`,
                  kind: 'Group',
                });
              }
              break;
            case 'widget':
              {
                const item = await window.bcms.sdk.widget.get(sItem.id);
                searchResults.value.push({
                  label: item.label,
                  url: `/dashboard/w/${item.cid}`,
                  kind: 'Widget',
                });
              }
              break;
            case 'template':
              {
                const item = await window.bcms.sdk.template.get(sItem.id);
                searchResults.value.push({
                  label: item.label,
                  url: `/dashboard/t/${item.cid}`,
                  kind: 'Template',
                });
              }
              break;
            case 'media':
              {
                const item = await window.bcms.sdk.media.getById(sItem.id);
                const path = window.bcms.media.getPath({
                  allMedia: await window.bcms.sdk.media.getAll(),
                  target: item,
                });
                searchResults.value.push({
                  label:
                    path.length === 1
                      ? path[0]
                      : `<span class="bcmsFilePath">${path
                          .slice(0, path.length - 1)
                          .join('/')}/</span>${path[path.length - 1]}`,
                  url: `/dashboard/media?search=${item._id}`,
                  kind: 'Media',
                });
              }
              break;
            case 'user':
              {
                const item = await window.bcms.sdk.user.get(sItem.id);
                searchResults.value.push({
                  label: item.username,
                  url: `/dashboard/u/${item._id}`,
                  kind: 'User',
                });
              }
              break;
            case 'tag':
              {
                const item = await window.bcms.sdk.tag.get(sItem.id);
                searchResults.value.push({
                  label: item.value,
                  url: `/dashboard/tag/${item.cid}`,
                  kind: 'Tag',
                });
              }
              break;
            case 'color':
              {
                const item = await window.bcms.sdk.color.get(sItem.id);
                searchResults.value.push({
                  label: item.label,
                  url: `/dashboard/color/${item.cid}`,
                  kind: 'Color',
                });
              }
              break;
            case 'apiKey':
              {
                const item = await window.bcms.sdk.apiKey.get(sItem.id);
                searchResults.value.push({
                  label: item.name,
                  url: `/dashboard/key-manager/${item._id}`,
                  kind: 'Template',
                });
              }
              break;
          }
        }
      });
    }

    watch(searchResults.value, (newValue) => {
      let newHeight = newValue.length * 52;

      const usersInSearchResults = searchResults.value.filter(
        (e) => e.kind === 'User',
      );

      if (usersInSearchResults && usersInSearchResults.length > 0) {
        newHeight += 48 + 12 + 10;
      }

      gsap.to(list.value, {
        height: newHeight,
        ease: 'ExpoScaleEase.config(0.9, 3, Power2.easeInOut)',
        duration: 0.2,
      });
    });

    onMounted(async () => {
      document.addEventListener('keydown', handleShowShortcut);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleShowShortcut);
    });

    return () => {
      return (
        <Transition name="fade">
          {show.value ? (
            <div class="fixed z-[1000000] top-0 left-0 w-full h-full flex justify-center pt-[10vh] items-start">
              <div class="relative z-10 flex flex-col bg-white w-[700px] max-w-[90vw] max-h-[80vh] rounded-2.5 pt-7.5 overflow-hidden dark:bg-dark dark:border dark:border-opacity-50 dark:border-grey">
                <div
                  class={`flex items-center mx-10 border-b border-dark transition-colors duration-300 hover:border-green focus-within:border-green dark:border-grey dark:text-white ${
                    searchResults.value.length > 0 ? 'mb-2' : 'mb-6'
                  }`}
                >
                  <BCMSIcon src="/search" class="w-5 h-5 fill-current" />
                  <input
                    ref={searchInput}
                    v-model={searchValue.value}
                    onKeyup={(event) => {
                      if (show.value && searchValue.value.length > 2) {
                        if (event.key === 'Enter') {
                          clearTimeout(timeout);
                          search();
                        } else {
                          clearTimeout(timeout);
                          timeout = setTimeout(async () => {
                            search();
                          }, 200);
                        }
                      }
                    }}
                    placeholder={
                      translations.value.modal.globalSearch.input.value
                        .placeholder
                    }
                    class="px-2.5 py-3 flex-1 leading-tight -tracking-0.01 bg-transparent focus:outline-none"
                  />
                </div>
                <BCMSGlobalSearchList
                  results={searchResults.value}
                  list={list}
                  onHide={() => hide()}
                />
              </div>
              <div
                class="absolute top-0 left-0 w-full h-full cursor-pointer bg-dark bg-opacity-30 dark:bg-opacity-70"
                tabindex="0"
                onClick={() => hide()}
              />
            </div>
          ) : (
            ''
          )}
        </Transition>
      );
    };
  },
});
export default component;
