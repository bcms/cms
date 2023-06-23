import { BCMSLink } from '../components';
import { computed, defineComponent } from 'vue';
import { BCMSEmptyState, BCMSLogo } from '../components';
import { useTranslation } from '../translations';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });

    const headMeta = window.bcms.meta;

    headMeta.set({
      title: translations.value.page.error.meta.title,
    });

    return () => {
      return (
        <div class="flex min-h-screen w-screen py-[50px] px-5">
          <div class="flex flex-col justify-center mx-auto">
            <BCMSLogo
              showOnMobile={true}
              class="absolute flex top-10 left-10 md:top-15"
            />
            <div class="flex flex-col items-center text-center dark:text-light">
              <h1 class="text-9.5 mb-5 -tracking-0.03 leading-none">
                {translations.value.page.error.title}
              </h1>
              <p class="leading-tight -tracking-0.01 mb-6">
                {translations.value.page.error.description}
              </p>
              <BCMSLink
                href="/dashboard"
                class="rounded-3.5 transition-all duration-300 inline-block font-medium text-base leading-normal -tracking-0.01 whitespace-normal no-underline py-1.5 px-5 mb-16 border border-solid select-none bg-dark border-dark text-white hover:shadow-btnPrimary hover:text-white focus:shadow-btnPrimary focus:text-white active:shadow-btnPrimary active:text-white disabled:bg-grey disabled:opacity-50 disabled:border-grey disabled:border-opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none dark:text-yellow"
              >
                {translations.value.page.error.cta}
              </BCMSLink>
              <BCMSEmptyState
                src="/404.png"
                maxWidth="550px"
                maxHeight="330px"
              />
            </div>
          </div>
        </div>
      );
    };
  },
});
export default component;
