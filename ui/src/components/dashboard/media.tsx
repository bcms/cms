import { computed, defineComponent } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSButton, BCMSImage, BCMSLink } from '..';
import { BCMSMediaType } from '@becomes/cms-sdk/types';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const store = window.bcms.vue.store;

    const recentMedia = computed(() => {
      return store.getters.media_items
        .filter((e) => e.type !== BCMSMediaType.DIR)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 15);
    });

    return () => {
      return (
        <div class="max-w-[500px]">
          <div class="flex items-center justify-between mb-10">
            <h2 class="text-[28px] leading-tight tracking-[-0.01em] dark:text-light">
              {translations.value.page.home.uploads.title}
            </h2>
            {recentMedia.value.length > 0 && (
              <BCMSLink
                href="/dashboard/media"
                class="leading-tight tracking-[-0.01em] text-green hover:underline dark:text-yellow"
              >
                {translations.value.page.home.uploads.seeAll}
              </BCMSLink>
            )}
          </div>
          {recentMedia.value.length > 0 ? (
            <div class="grid grid-cols-5 gap-2.5">
              {recentMedia.value.map((media, index) => {
                return (
                  <BCMSLink
                    href={`/dashboard/media?search=${media._id}`}
                    class="flex aspect-square w-full max-h-20"
                  >
                    <BCMSImage
                      key={index}
                      media={media}
                      alt="File"
                      class="p-0.5 w-full h-full  object-cover"
                    />
                  </BCMSLink>
                );
              })}
            </div>
          ) : (
            <div>
              <BCMSButton href="/dashboard/media" class="mb-6">
                {translations.value.page.home.uploads.cta}
              </BCMSButton>
              <div class="leading-tight tracking-[-0.01em] mb-8 dark:text-light">
                {translations.value.page.home.uploads.noRecentUploads}
              </div>
            </div>
          )}
        </div>
      );
    };
  },
});

export default component;
