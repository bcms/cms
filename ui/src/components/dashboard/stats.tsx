import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useTranslation } from '../../translations';
import { BCMSJwtRoleName } from '@becomes/cms-sdk/types';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });

    const myStats = ref<{
      entries: number;
      megabytes: number;
      members: number;
      [key: string]: number;
    }>({
      entries: 0,
      megabytes: 0,
      members: 0,
    });

    const statsCards = computed(() => {
      return [
        {
          title: translations.value.page.home.stats.entries,
          value: myStats.value.entries === 0 ? 0 : myStats.value.entries,
        },
        {
          title: translations.value.page.home.stats.uploads,
          value:
            myStats.value.megabytes === 0
              ? 0
              : myStats.value.megabytes.toFixed(0),
        },
        {
          title: translations.value.page.home.stats.members,
          value: myStats.value.members === 0 ? 0 : myStats.value.members,
        },
      ];
    });

    onMounted(async () => {
      await window.bcms.util.throwable(async () => {
        const user = await window.bcms.sdk.user.get();

        myStats.value.entries = await window.bcms.sdk.entry.countByUser();
        myStats.value.megabytes = 0;
        myStats.value.members = (await window.bcms.sdk.user.getAll()).length;

        if (
          user.roles[0].name === BCMSJwtRoleName.ADMIN ||
          user.customPool.policy.media.get
        ) {
          const media = await window.bcms.sdk.media.getAll();

          for (let i = 0; i < media.length; i++) {
            const item = media[i];

            if (item.userId === user._id) {
              myStats.value.megabytes += item.size / 1024 / 1024;
            }
          }
        }
      });
    });

    // Watch for changes in myStats and update statsCards accordingly
    watch(myStats, () => {
      statsCards.value.forEach((card, index) => {
        const targetValue = myStats.value[index];
        if (parseFloat(card.value.toString()) < targetValue) {
          const interval = setInterval(() => {
            const currentValue = parseFloat(card.value.toString());
            if (currentValue < targetValue) {
              card.value = currentValue + 1;
            } else {
              clearInterval(interval);
            }
          }, 100);
        }
      });
    });

    return () => {
      return (
        <div class="mb-17.5">
          <h2 class="text-[28px] leading-tight tracking-[-0.01em] mb-10 dark:text-light">
            {translations.value.page.home.stats.title}
          </h2>
          <div class="grid grid-cols-1 gap-5 desktop:grid-cols-[repeat(3,minmax(200px,1fr))] desktop:max-w-max">
            {statsCards.value.map((card, index) => {
              return (
                <div
                  key={index}
                  class="flex flex-col items-center justify-center text-center border border-green/50 px-3 py-14 rounded-[40px] bg-light dark:border-yellow/30 dark:text-light dark:bg-darkGrey"
                >
                  <div class="text-[50px] leading-none tracking-[-0.02em] mb-4">
                    {card.value}
                  </div>
                  <div class="leading-tight tracking-[-0.01em]">
                    {card.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };
  },
});

export default component;
