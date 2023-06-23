import { computed, defineComponent, ref } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSLink } from '..';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });

    const activity = ref(null);

    return () => {
      return (
        <div>
          <h2 class="text-[28px] leading-tight tracking-[-0.01em] mb-10 dark:text-light">
            {translations.value.page.home.activity.title}
          </h2>
          {activity.value ? (
            <div class="grid grid-cols-1 gap-3.5">
              <div class="flex items-center leading-tight tracking-[-0.01em] pb-3.5 border-b border-grey dark:text-light dark:border-grey/50">
                <span class="truncate mr-3.5">
                  <u>Olivia</u>{' '}
                  <span class="text-yellow font-medium">edited</span> the{' '}
                  <BCMSLink href="/" class="underline">
                    About Us entry
                  </BCMSLink>
                </span>
                <span class="font-light text-grey flex-shrink-0">5min ago</span>
              </div>
              <div class="flex items-center leading-tight tracking-[-0.01em] pb-3.5 border-b border-grey dark:text-light dark:border-grey/50">
                <span class="truncate mr-3.5">
                  <u>Benjamin</u>{' '}
                  <span class="text-green font-medium">created</span> a new
                  widget named{' '}
                  <BCMSLink href="/" class="underline">
                    Recent Posts
                  </BCMSLink>
                </span>
                <span class="font-light text-grey flex-shrink-0">
                  18min ago
                </span>
              </div>
              <div class="flex items-center leading-tight tracking-[-0.01em] pb-3.5 border-b border-grey dark:text-light dark:border-grey/50">
                <span class="truncate mr-3.5">
                  <u>Emma</u> <span class="text-red font-medium">deleted</span>{' '}
                  <u>homepage.jpg</u>
                </span>
                <span class="font-light text-grey flex-shrink-0">1h ago</span>
              </div>
            </div>
          ) : (
            <div>
              <div class="leading-tight tracking-[-0.01em] mb-8 dark:text-light">
                {translations.value.page.home.activity.noRecentActivity}
              </div>
            </div>
          )}
        </div>
      );
    };
  },
});

export default component;
