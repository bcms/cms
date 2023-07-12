import {
  Transition,
  computed,
  defineComponent,
  nextTick,
  ref,
  watch,
} from 'vue';
import { useTranslation } from '../../translations';
import { BCMSButton, BCMSIcon, BCMSLink } from '../../components';
import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const store = window.bcms.vue.store;
    const userMe = computed(() => store.getters.user_me);
    const isAdmin = computed(() => {
      return userMe.value?.roles[0].name === BCMSJwtRoleName.ADMIN;
    });
    const canSeeMedia = computed(() => {
      return isAdmin.value || userMe.value?.customPool.policy.media.get;
    });
    const templates = computed(() => {
      return store.getters.template_items;
    });

    const showCreateNewDropdown = ref(false);
    const showEntriesDropdown = ref(false);
    const showAllEntries = ref(false);
    const entriesDropdownDOM = ref<HTMLElement>();

    const filteredTemplates = computed(() => {
      return isAdmin.value
        ? templates.value
        : templates.value.filter(
            (e) =>
              userMe.value?.customPool.policy.templates.find(
                (j) => j.get && j._id === e._id,
              ) && !e.singleEntry,
          );
    });

    const createNewOptions = computed(() => [
      {
        label: translations.value.page.home.newOptions.template,
        icon: '/administration/template',
        href: '/dashboard/t',
        show: isAdmin.value,
      },
      {
        label: translations.value.page.home.newOptions.widget,
        icon: '/administration/widget',
        href: '/dashboard/w',
        show: isAdmin.value,
      },
      {
        label: translations.value.page.home.newOptions.group,
        icon: '/administration/group',
        href: '/dashboard/g',
        show: isAdmin.value,
      },
      {
        label: translations.value.page.home.newOptions.fileUpload,
        icon: '/administration/media',
        href: '/dashboard/media',
        show: canSeeMedia.value,
      },
      {
        label: translations.value.page.home.newOptions.entry.label,
        icon: '/file',
        show: isAdmin.value || filteredTemplates.value.length > 0,
        onClick() {
          showEntriesDropdown.value = !showEntriesDropdown.value;
        },
      },
    ]);

    const filteredNewOptions = computed(() => {
      return createNewOptions.value.filter((e) => e.show);
    });

    const firstName = computed(() => {
      if (userMe.value?.customPool.personal.firstName) {
        return userMe.value?.customPool.personal.firstName;
      }
      let firstWord = userMe.value?.username.split(' ')[0];
      if (firstWord) {
        firstWord =
          firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
        return firstWord;
      }
      return '';
    });

    // TODO: Extract to a directive or similar
    const checkIfDropdownIsOverflowing = () => {
      nextTick(() => {
        if (entriesDropdownDOM.value) {
          const rect = entriesDropdownDOM.value.getBoundingClientRect();
          if (
            rect.bottom >
            (window.innerHeight || document.documentElement.clientHeight)
          ) {
            // Bottom is out of viewport
            entriesDropdownDOM.value.style.bottom = `${
              rect.bottom - window.innerHeight + 80
            }px`;
          }

          if (
            rect.right >
            (window.innerWidth || document.documentElement.clientWidth)
          ) {
            // Right side is out of viewport
            entriesDropdownDOM.value.style.right = `${
              rect.right - window.innerWidth
            }px`;
          }
        }
      });
    };

    watch(showCreateNewDropdown, (newVal) => {
      if (newVal) {
        showEntriesDropdown.value = false;
      }
    });

    watch(showEntriesDropdown, (newVal) => {
      if (newVal) {
        checkIfDropdownIsOverflowing();
      }
    });

    return () => {
      return (
        userMe.value && (
          <div>
            <div class="mb-10">
              <div class="flex items-center justify-between max-w-[445px]">
                <div>
                  <div class="text-[38px] leading-tight font-light tracking-[-0.02em] mb-1 dark:text-light">
                    {translations.value.page.home.greeting.title(
                      firstName.value,
                    )}
                  </div>
                  <div class="leading-tight font-light tracking-[-0.01em] dark:text-light">
                    {translations.value.page.home.greeting.wish}
                  </div>
                </div>
                <div class="relative shrink-0">
                  <BCMSButton
                    onClick={() => {
                      showCreateNewDropdown.value =
                        !showCreateNewDropdown.value;
                    }}
                  >
                    <span class="flex items-center">
                      <span class="mr-1">
                        {translations.value.page.home.newOptions.title}
                      </span>
                      <BCMSIcon src="/plus" class="fill-current w-4 h-4" />
                    </span>
                  </BCMSButton>
                  <Transition name="createNew">
                    {showCreateNewDropdown.value && (
                      <div
                        v-clickOutside={() => {
                          showCreateNewDropdown.value = false;
                        }}
                        class="absolute -bottom-2 right-0 w-[320px] max-w-[100vw] translate-y-full pt-5 pb-2.5 rounded-2.5 shadow-cardLg bg-white dark:bg-[#504F54]"
                      >
                        <div class="text-xs leading-normal tracking-0.06 font-light uppercase px-5 mb-2.5 dark:text-[#D1D2D3]">
                          {translations.value.page.home.newOptions.title}
                        </div>
                        <div class="relative grid grid-cols-1">
                          {filteredNewOptions.value.map((e, index) => {
                            return e.href ? (
                              <BCMSLink
                                key={index}
                                href={e.href}
                                class="flex items-center px-5 py-3.5 transition-colors duration-300 hover:text-green hover:bg-light dark:text-[#D1D2D3] dark:hover:text-yellow dark:hover:bg-[#38373C]"
                              >
                                <BCMSIcon
                                  src={e.icon}
                                  class="w-6 h-6 fill-current mr-3.5"
                                />
                                <span class="leading-tight -tracking-0.01">
                                  {e.label}
                                </span>
                              </BCMSLink>
                            ) : (
                              <button
                                class="flex items-center justify-between px-5 py-3.5 transition-colors duration-300 hover:text-green hover:bg-light dark:text-[#D1D2D3] dark:hover:text-yellow dark:hover:bg-[#38373C]"
                                onClick={e.onClick}
                              >
                                <div class="flex items-center">
                                  <BCMSIcon
                                    src={e.icon}
                                    class="w-6 h-6 fill-current mr-3.5"
                                  />
                                  <span class="leading-tight -tracking-0.01">
                                    {e.label}
                                  </span>
                                </div>
                                <BCMSIcon
                                  src="/chevron/right"
                                  class="w-4 h-4 fill-current"
                                />
                              </button>
                            );
                          })}
                          <Transition name="fade">
                            {showEntriesDropdown.value && (
                              <div
                                v-clickOutside={() => {
                                  showEntriesDropdown.value = false;
                                }}
                                ref={entriesDropdownDOM}
                                class="absolute w-[320px] max-w-[100vw] translate-x-full translate-y-full pt-5 pb-2.5 rounded-2.5 shadow-cardLg bg-white dark:bg-[#504F54]"
                                style="right: 14px; bottom: 80px"
                              >
                                <div class="text-xs leading-normal tracking-0.06 font-light uppercase px-5 mb-2.5 dark:text-[#D1D2D3]">
                                  {
                                    translations.value.page.home.newOptions
                                      .entry.dropdown.title
                                  }
                                </div>
                                <div class="grid grid-cols-1 max-h-[250px] overflow-y-auto">
                                  {filteredTemplates.value.length > 0 ? (
                                    filteredTemplates.value
                                      .slice(
                                        0,
                                        showAllEntries.value
                                          ? filteredTemplates.value.length
                                          : 4,
                                      )
                                      .map((template, index) => {
                                        return (
                                          <BCMSLink
                                            key={index}
                                            href={`/dashboard/t/${template.cid}/e/create`}
                                            class="flex items-center px-5 py-3.5 transition-colors duration-300 hover:text-green hover:bg-light dark:text-[#D1D2D3] dark:hover:text-yellow dark:hover:bg-[#38373C]"
                                          >
                                            <span class="leading-tight -tracking-0.01">
                                              {template.label}
                                            </span>
                                          </BCMSLink>
                                        );
                                      })
                                  ) : (
                                    <div class="text-xs leading-normal tracking-0.06 font-light px-5 mb-2.5 dark:text-[#D1D2D3]">
                                      {
                                        translations.value.page.home.newOptions
                                          .entry.dropdown.noTemplates
                                      }
                                      <BCMSLink class='ml-1 underline hover:no-underline' href={'/dashboard/t'}>
                                        {
                                          translations.value.page.home
                                            .newOptions.entry.dropdown
                                            .createATemplate
                                        }
                                      </BCMSLink>
                                    </div>
                                  )}
                                  <button
                                    class={`flex items-center px-5 py-3.5 transition-colors duration-300 ${
                                      filteredTemplates.value.length > 4 &&
                                      !showAllEntries.value
                                        ? ''
                                        : 'hidden'
                                    } hover:text-green hover:bg-light dark:text-[#D1D2D3] dark:hover:text-yellow dark:hover:bg-[#38373C]`}
                                    onClick={() =>
                                      (showAllEntries.value = true)
                                    }
                                  >
                                    <span class="leading-tight -tracking-0.01">
                                      {
                                        translations.value.page.home.newOptions
                                          .entry.dropdown.seeAll
                                      }
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </Transition>
                        </div>
                      </div>
                    )}
                  </Transition>
                </div>
              </div>
            </div>
            <button
              class="flex items-center border border-grey/50 px-3.5 py-[11px] rounded-2.5 bg-white/50 w-[445px] max-w-full mb-20 dark:bg-darkGrey dark:text-light"
              onClick={() => window.bcms.globalSearch.show()}
            >
              <BCMSIcon src="/search" class="w-5 h-5 fill-current mr-2.5" />
              <span class=" leading-tight tracking-[-0.01em] text-left flex-1 mt-0.5">
                {translations.value.page.home.search}
              </span>
              <div class="flex items-center space-x-1 px-[7px] py-1.5 rounded-[5px] bg-[#F0F0F0] dark:text-dark dark:bg-grey">
                <BCMSIcon src="/command" class="w-3.5 h-3.5 fill-current" />
                <BCMSIcon src="/plus" class="w-3.5 h-3.5 fill-current" />
                <span class="text-sm leading-none tracking-[-0.01em] mt-0.5">
                  K
                </span>
              </div>
            </button>
          </div>
        )
      );
    };
  },
});

export default component;
