import { computed, defineComponent } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import { useTheme } from '@bcms/selfhosted-ui/hooks/theme';
import { type LayoutNames, layouts } from '@bcms/selfhosted-ui/layouts';
import {
    initializePageTransition,
    usePageTransition
} from '@bcms/selfhosted-ui/services/page-transition';
import Notification from '@bcms/selfhosted-ui/components/notification';
import { Tooltip } from '@bcms/selfhosted-ui/components/tooltip';
import { modalService } from '@bcms/selfhosted-ui/services/modal';

export const App = defineComponent({
    setup() {
        useTheme();
        const route = useRoute();
        const router = useRouter();
        initializePageTransition(route, router);
        window.bcms.pageTransition = usePageTransition;

        const meta = computed(
            () =>
                route.meta as {
                    layout?: LayoutNames;
                    title?: string;
                    class?: string;
                },
        );
        const Layout = computed(
            () => layouts[meta.value.layout || 'NoneLayout'],
        );

        router.beforeEach((to) => {
            if (to.meta.title) {
                window.bcms.meta.set({ title: to.meta.title as string });
            }
        });

        return () => (
            <>
                <Layout.value {...meta.value}>
                    <RouterView />
                </Layout.value>

                {modalService.mount()}

                <Notification />
                <Tooltip />
            </>
        );
    },
});
