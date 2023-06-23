import { computed, defineComponent } from 'vue';
import { Buffer } from 'buffer';
import { useRoute, useRouter } from 'vue-router';
import { useTranslation } from '../translations';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });

    const throwable = window.bcms.util.throwable;
    const router = useRouter();
    const route = useRoute();
    const headMeta = window.bcms.meta;

    headMeta.set({
      title: translations.value.page.login.meta.title,
    });

    async function init() {
      const query = route.query as {
        otp: string;
        forward?: string;
        user?: string;
      };
      await throwable(async () => {
        const result = await window.bcms.sdk.isLoggedIn();
        if (result) {
          if (query.forward) {
            await router.push({ path: query.forward, replace: true });
          } else {
            await router.push({ path: '/dashboard', replace: true });
          }
          return;
        } else {
          if (query.otp || window.location.host === 'localhost:8080') {
            await throwable(
              async () => {
                return await window.bcms.sdk.shim.verify.otp(
                  query.otp,
                  !!query.user
                );
              },
              async () => {
                if (query.forward) {
                  await router.push({ path: query.forward, replace: true });
                } else {
                  await router.push({ path: '/dashboard', replace: true });
                }
              }
            );
            return;
          }
          window.location.href = `https://cloud.thebcms.com/login?type=cb&d=${Buffer.from(
            JSON.stringify({
              host: window.location.host,
              iid: window.bcmsCloud?.iid,
              forward: query.forward,
            })
          ).toString('hex')}`;
        }
      });
      return;
    }
    window.bcms.util.throwable(async () => {
      await init();
    });

    return () => {
      return <div />;
    };
  },
});
export default component;
