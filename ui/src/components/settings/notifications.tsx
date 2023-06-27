import { computed, defineComponent } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSToggleInput } from '../input';
import { DefaultComponentProps } from '../_default';

const component = defineComponent({
  props: {
    ...DefaultComponentProps,
  },
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });

    return () => (
      <div>
        <h2 class="text-[28px] leading-none font-normal -tracking-0.01 mb-7.5 dark:text-light">
          {translations.value.page.settings.notifications.title}
        </h2>
        <div class="flex items-center space-x-2.5 mb-5">
          <BCMSToggleInput />
          <span class="cursor-pointer -tracking-0.01 leading-tight">
            {translations.value.page.settings.notifications.notifyMeCta}
          </span>
        </div>
        <div class="flex items-center space-x-2.5">
          <BCMSToggleInput />
          <span class="cursor-pointer -tracking-0.01 leading-tight">
            {translations.value.page.settings.notifications.notifyMeCta}
          </span>
        </div>
      </div>
    );
  },
});

export default component;
