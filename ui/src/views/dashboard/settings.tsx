import { computed, defineComponent, onMounted, ref } from 'vue';
import {
  BCMSButton,
  SettingsAccountManagement,
  SettingsLanguages,
  SettingsTeam,
  BCMSSpinner,
} from '../../components';
import { useTranslation } from '../../translations';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const store = window.bcms.vue.store;
    const headMeta = window.bcms.meta;
    const user = computed(() => store.getters.user_me);
    const showSpinner = ref(false);

    headMeta.set({
      title: translations.value.page.settings.title,
    });

    onMounted(async () => {
      if (!user.value) {
        await window.bcms.util.throwable(async () => {
          await window.bcms.sdk.user.get();
        });
      }
    });

    return () => (
      <>
        <div class="py-7 max-w-[680px] space-y-15 desktop:pt-0">
          <h1 class="text-4xl leading-none font-normal -tracking-0.01 dark:text-light">
            {translations.value.page.settings.title}
          </h1>
          <BCMSButton
            onClick={() => {
              window.bcms.modal.backup.show({});
            }}
          >
            {translations.value.page.settings.backups}
          </BCMSButton>
          <SettingsAccountManagement />
          {/* <SettingsNotifications /> */}
          <SettingsLanguages />
          <SettingsTeam />
        </div>
        <BCMSSpinner show={showSpinner.value} />
      </>
    );
  },
});

export default component;
