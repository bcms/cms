import { defineComponent, onMounted, ref, Teleport } from 'vue';
import { delay } from '@thebcms/selfhosted-ui/util/delay';
import { BgDashboard } from '@thebcms/selfhosted-ui/components/bg-dashboard';
import { DashboardLayoutAsideContent } from '@thebcms/selfhosted-ui/layouts/dashboard/aside-content';
import { BCMSLogo } from '@thebcms/selfhosted-ui/components/logo';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export const DashboardLayout = defineComponent({
    setup(_, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const pageTransition = window.bcms.pageTransition();
        const [screen] = window.bcms.useScreenSize();

        const mobileBrakePoint = 900;
        const mobileShowNav = ref(false);
        const [t1State] = pageTransition.register(() => delay(300));
        const [t2State] = pageTransition.register(() => delay(300));

        onMounted(async () => {
            await throwable(async () => {
                await sdk.user.get('me');
                await sdk.template.getAll();
            });
        });

        return () => (
            <div class={`flex`}>
                <BgDashboard
                    class={`transition-all duration-300 ${
                        t1State.value === 'in' || t1State.value === 'in-done'
                            ? 'opacity-100'
                            : 'opacity-0'
                    }`}
                />
                <div class={`relative flex w-full z-10`}>
                    <main
                        class={`relative ${
                            t2State.value === 'in' ||
                            t2State.value === 'in-done'
                                ? 'top-0 opacity-100'
                                : 'top-48 opacity-0'
                        } transition-all duration-300 max-desktop:pl-6 pl-[338px] max-desktop:pt-[80px] py-[51px] pr-6 w-full min-h-screen text-black dark:text-white`}
                    >
                        {ctx.slots.default ? ctx.slots.default() : ''}
                    </main>
                    {screen.value.width > mobileBrakePoint ? (
                        <aside
                            class={`${
                                t1State.value === 'in' ||
                                t1State.value === 'in-done'
                                    ? 'left-0'
                                    : 'left-[-312px]'
                            } transition-all duration-300 fixed top-0 flex flex-col h-screen overflow-y-auto overflow-x-hidden border-r border-r-gray/50 dark:border-r-darkGray/50 w-[312px]`}
                        >
                            <DashboardLayoutAsideContent />
                        </aside>
                    ) : (
                        <div
                            class={`fixed left-0 ${
                                t1State.value === 'in' ||
                                t1State.value === 'in-done'
                                    ? 'top-0'
                                    : 'top-[-312px]'
                            } transition-all duration-300 w-screen border-b border-b-gray/50 dark:border-b-gray`}
                        >
                            <div class={`flex gap-2 px-6 py-4 backdrop-blur-lg bg-white/20 dark:bg-dark/20`}>
                                <BCMSLogo />
                                <button
                                    class={`ml-auto`}
                                    onClick={() => {
                                        mobileShowNav.value =
                                            !mobileShowNav.value;
                                    }}
                                >
                                    <Icon
                                        class={`w-6 text-dark dark:text-white fill-current`}
                                        src={'/nav'}
                                    />
                                </button>
                            </div>
                            {mobileShowNav.value && (
                                <Teleport to={`body`}>
                                    <aside
                                        class={`bg-white dark:bg-dark z-1000 transition-all duration-300 fixed top-0 flex flex-col gap-6 px-6 py-8 h-screen overflow-y-auto overflow-x-hidden border-r border-r-gray/50 dark:border-r-darkGray/50 w-full`}
                                    >
                                        <DashboardLayoutAsideContent onCloseNav={() => {
                                            mobileShowNav.value = false;
                                        }} />
                                    </aside>
                                </Teleport>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    },
});
