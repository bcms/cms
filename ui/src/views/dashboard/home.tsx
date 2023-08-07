import { computed, defineComponent, onMounted, ref } from 'vue';
import { useTranslation } from '../../translations';
import {
  // BCMSDashboardActivity,
  BCMSDashboardIntro,
  BCMSDashboardMedia,
  BCMSDashboardMembers,
  BCMSDashboardStats,
  BCMSIcon,
  BCMSLink,
} from '../../components';
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

    const headMeta = window.bcms.meta;
    headMeta.set({
      title: translations.value.page.home.meta.title,
    });

    const docsAndResources = ref([
      {
        label: translations.value.page.home.docsAndResources.documentation,
        icon: '/documentation',
        href: 'https://docs.thebcms.com/',
      },
      {
        label: translations.value.page.home.docsAndResources.tutorials,
        icon: '/tutorials',
        href: 'https://thebcms.com/blog/tags/tutorials',
      },
      {
        label: translations.value.page.home.docsAndResources.codeStarters,
        icon: '/code-starters',
        href: 'https://github.com/bcms/starters',
      },
    ]);

    const supportAndCommunity = ref([
      {
        label: 'GiHub',
        icon: '/github',
        href: 'https://github.com/bcms/cms/',
      },
      {
        label: 'Slack',
        icon: '/slack',
        href: 'https://thebcms.com/slack',
      },
      {
        label: 'Reddit',
        icon: '/reddit',
        href: 'https://www.reddit.com/r/thebcms',
      },
      {
        label: 'Twitter',
        icon: '/twitter',
        href: 'https://twitter.com/thebcms',
      },
      {
        label: 'Linkedin',
        icon: '/linkedin',
        href: 'https://www.linkedin.com/company/thebcms/',
      },
      {
        label: translations.value.page.home.supportAndCommunity.contact,
        icon: '/phone',
        href: 'https://thebcms.com/contact',
      },
    ]);

    onMounted(async () => {
      await window.bcms.util.throwable(async () => {
        const user = await window.bcms.sdk.user.get();

        if (user) {
          if (
            user.roles[0].name === BCMSJwtRoleName.ADMIN ||
            user.customPool.policy.media.get
          ) {
            await window.bcms.sdk.media.getAll();
          }
        }
      });
    });

    return () => {
      return store.getters.feature_available('dashboard') ? (
        userMe.value && (
          <div class="max-w-[1920px] pt-7.5 desktop:pt-0">
            <BCMSDashboardIntro />
            <BCMSDashboardStats />
            {canSeeMedia.value && (
              <div class="grid grid-cols-1 gap-10 mb-17.5 xl:grid-cols-2 xl:gap-14">
                {/* TODO: <BCMSDashboardActivity /> */}
                <BCMSDashboardMedia />
              </div>
            )}
            {isAdmin.value && <BCMSDashboardMembers />}
            <div class="mb-17.5">
              <h2 class="text-[28px] leading-tight tracking-[-0.01em] mb-10 dark:text-light">
                {translations.value.page.home.docsAndResources.title}
              </h2>
              <div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
                {docsAndResources.value.map((item, index) => {
                  return (
                    <BCMSLink
                      key={index}
                      href={item.href}
                      newTab
                      class="flex items-center px-5 py-[19px] shadow-input rounded-3xl transition-shadow duration-300 hover:shadow-inputHover dark:bg-darkGrey dark:border dark:border-grey/50 dark:text-light"
                    >
                      <BCMSIcon
                        src={item.icon}
                        class="w-7.5 h-7.5 stroke-current mr-4"
                      />
                      <span class="leading-tight tracking-[-0.01em]">
                        {item.label}
                      </span>
                    </BCMSLink>
                  );
                })}
              </div>
            </div>
            <div class="mb-17.5">
              <h2 class="text-[28px] leading-tight tracking-[-0.01em] mb-10 dark:text-light">
                {translations.value.page.home.supportAndCommunity.title}
              </h2>
              <div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
                {supportAndCommunity.value.map((item, index) => {
                  return (
                    <BCMSLink
                      key={index}
                      href={item.href}
                      newTab
                      class="flex items-center px-5 py-[19px] shadow-input rounded-3xl transition-shadow duration-300 hover:shadow-inputHover dark:bg-darkGrey dark:border dark:border-grey/50 dark:text-light"
                    >
                      <BCMSIcon
                        src={item.icon}
                        class={`w-7.5 h-7.5  mr-4 ${
                          item.label === 'Contact' ? 'stroke-current' : ''
                        }`}
                      />
                      <span class="leading-tight tracking-[-0.01em]">
                        {item.label}
                      </span>
                    </BCMSLink>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        <div class="text-center m-auto flex flex-col justify-center mt-20 desktop:mt-[25vh]">
          <h1 class="text-2xl font-light mb-8 desktop:text-3xl dark:text-light">
            {translations.value.page.home.featureDisabled.title}
          </h1>
        </div>
      );
    };
  },
});

export default component;
