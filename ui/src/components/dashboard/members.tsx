import { computed, defineComponent } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSButton, BCMSLink, BCMSMemberItem } from '..';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const store = window.bcms.vue.store;
    const userMe = computed(() => store.getters.user_me);

    const members = computed(() =>
      store.getters.user_items.filter((e) => e._id !== userMe.value?._id),
    );

    return () => {
      return (
        <div class="max-w-[890px] mb-17.5">
          <div class="flex flex-col gap-5 justify-between mb-10 desktop:flex-row desktop:items-center desktop:gap-6">
            <div class="flex items-center">
              <h2 class="text-[28px] leading-tight tracking-[-0.01em] mr-6 dark:text-light">
                {translations.value.page.home.members.title}
              </h2>
              {members.value.length > 0 && (
                <BCMSButton href="https://cloud.thebcms.com/dashboard" newTab>
                  {translations.value.page.home.members.invite}
                </BCMSButton>
              )}
            </div>
            {members.value.length > 0 && (
              <BCMSLink
                href="/dashboard/settings"
                class="leading-tight tracking-[-0.01em] text-green hover:underline dark:text-yellow"
              >
                {translations.value.page.home.members.seeAll}
              </BCMSLink>
            )}
          </div>
          {members.value.length > 0 ? (
            <div class="grid grid-cols-1 gap-6 desktop:grid-cols-2">
              {members.value.map((member, index) => {
                return (
                  <BCMSMemberItem
                    item={member}
                    dashboard={true}
                    isAdmin={true}
                    key={index}
                  />
                );
              })}
            </div>
          ) : (
            <div class="-mt-6">
              <div class="leading-tight tracking-[-0.01em] mb-8 dark:text-light">
                {translations.value.page.home.members.noUsers}
              </div>
              <BCMSButton href="https://cloud.thebcms.com/dashboard" newTab>
                {translations.value.page.home.members.invite}
              </BCMSButton>
            </div>
          )}
        </div>
      );
    };
  },
});

export default component;
