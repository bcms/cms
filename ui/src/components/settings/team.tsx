import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';
import { computed, defineComponent, onMounted } from 'vue';
import { useTranslation } from '../../translations';
import { DefaultComponentProps } from '../_default';
import { BCMSButton, BCMSMemberItem } from '..';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
  },
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const store = window.bcms.vue.store;
    const userMe = computed(() => store.getters.user_me);
    const members = computed(() =>
      store.getters.user_items.filter((e) => e._id !== userMe.value?._id),
    );
    const isAdmin = computed(() => {
      return userMe.value?.roles[0].name === BCMSJwtRoleName.ADMIN;
    });

    onMounted(async () => {
      await window.bcms.util.throwable(async () => {
        await window.bcms.sdk.user.getAll();
      });
    });

    return () => (
      <div>
        <h2
          class={`text-[28px] leading-none font-normal -tracking-0.01 ${
            members.value.length > 0 ? 'mb-10' : 'mb-7.5'
          } dark:text-light`}
        >
          {translations.value.page.settings.team.title}
        </h2>
        {members.value.length > 0 ? (
          <div class="relative border border-t-0 border-grey border-opacity-30 rounded-b-3.5 pt-5 pb-7.5 pr-7.5 pl-5.5 mb-10">
            <header class="absolute -top-2.5 -left-px flex items-center justify-between before:w-4 before:h-2.5 before:absolute before:top-0 before:left-0 before:border-t before:border-l before:border-grey before:border-opacity-30 before:rounded-tl-2.5 after:w-2.5 after:h-2.5 after:absolute after:top-0 after:right-0 after:border-t after:border-r after:border-grey after:border-opacity-30 after:rounded-tr-2.5 w-[calc(100%+2px)]">
              <div class="flex items-center border-b border-grey border-opacity-50 relative w-full justify-between border-none ">
                <div class="flex items-center relative w-full pl-5.5 pr-3.5 translate-x-0 translate-y-[-7px] text-dark after:relative after:top-1/2 after:flex-grow after:h-px after:bg-grey after:bg-opacity-30 after:translate-x-1 after:-translate-y-0.5">
                  <div class="text-xs leading-normal tracking-0.06 uppercase flex-grow-0 mr-1 flex-shrink-0 text-inherit dark:text-light">
                    {translations.value.page.settings.team.subtitle}
                  </div>
                </div>
              </div>
            </header>
            <div
              class={`grid grid-cols-1 gap-5.5 ${isAdmin.value ? 'mb-10' : ''}`}
            >
              {members.value.map((member) => (
                <BCMSMemberItem item={member} isAdmin={isAdmin.value} />
              ))}
            </div>
            {isAdmin.value && (
              <div>
                {
                  // TODO: Update invite href
                }
                <BCMSButton href="https://cloud.thebcms.com/dashboard" newTab>
                  {translations.value.page.settings.team.inviteCta({
                    pl: 'a new',
                  })}
                </BCMSButton>
              </div>
            )}
          </div>
        ) : (
          isAdmin.value && (
            <BCMSButton href="https://cloud.thebcms.com/dashboard" newTab>
              {translations.value.page.settings.team.inviteCta({
                pl: 'the first',
              })}
            </BCMSButton>
          )
        )}
      </div>
    );
  },
});

export default component;
