import { computed, defineComponent } from 'vue';
import BCMSButton from '../button';
import { useTranslation } from '../../translations';
import { DefaultComponentProps } from '../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
  },
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const store = window.bcms.vue.store;
    const user = computed(() => store.getters.user_me);

    return () => (
      <div class="max-w-[420px]">
        <h2 class="text-[28px] leading-none font-normal -tracking-0.01 mb-7.5 dark:text-light">
          {translations.value.page.settings.accountManagement.title}
        </h2>
        {user.value && (
          <div class="flex items-center mb-7.5">
            <div class="mr-5 select-none">
              {user.value.customPool.personal.avatarUri ? (
                <img
                  src={user.value.customPool.personal.avatarUri}
                  alt={user.value.username}
                  class="w-20 h-20 object-cover rounded-full"
                />
              ) : (
                <div class="w-20 h-20 rounded-full bg-grey bg-opacity-70 border-2 border-green mr-2.5 flex justify-center items-center dark:bg-darkGrey dark:border-yellow">
                  <span class="text-white font-semibold relative top-0.5 text-3xl">
                    {user.value.username
                      .split(' ')
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                </div>
              )}
            </div>
            <div class="text-dark dark:text-light">
              <div class="text-xl font-medium">{user.value.username}</div>
              <div>{user.value.email}</div>
            </div>
          </div>
        )}
        {/* TODO: Account settings is not a page, but a modal */}
        <BCMSButton
          href="https://cloud.thebcms.com/dashboard?modal=account-settings"
          newTab={true}
        >
          {translations.value.page.settings.accountManagement.editCta}
        </BCMSButton>
      </div>
    );
  },
});
export default component;
