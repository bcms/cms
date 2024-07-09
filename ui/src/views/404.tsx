import { defineComponent } from 'vue';
import { EmptyState } from '@thebcms/selfhosted-ui/components/empty-state';
import { Link } from '@thebcms/selfhosted-ui/components/link';
import { BgAuth } from '@thebcms/selfhosted-ui/components/bg-auth';
import { BCMSLogo } from '@thebcms/selfhosted-ui/components/logo';
import { delay } from '@thebcms/selfhosted-ui/util/delay';

export const P404View = defineComponent({
    setup() {
        const headMeta = window.bcms.meta;
        const pageTransition = window.bcms.pageTransition();

        const [t1State] = pageTransition.register(() => delay(300));
        const [t2State] = pageTransition.register(() => delay(300));

        headMeta.set({
            title: 'Oops! Page not found',
        });

        return () => {
            return (
                <div
                    class={`min-w-screen min-h-screen text-dark flex flex-col items-center`}
                >
                    <BgAuth
                        class={`transition-all duration-300 ${
                            t1State.value === 'in' ||
                            t1State.value === 'in-done'
                                ? 'opacity-100'
                                : 'opacity-0'
                        }`}
                    />
                    <div
                        class={`relative ${
                            t2State.value === 'in' ||
                            t2State.value === 'in-done'
                                ? 'top-0 opacity-100'
                                : 'top-48 opacity-0'
                        } transition-all duration-300 flex flex-col items-center h-full`}
                    >
                        <BCMSLogo class={`mt-36`} />
                        <div class="flex items-center justify-center pt-[20%] px-5">
                            <div class="flex flex-col justify-center mx-auto">
                                <div class="flex flex-col items-center text-center dark:text-light">
                                    <h1 class="text-9.5 mb-5 -tracking-0.03 leading-none">
                                        Oops! Page not found
                                    </h1>
                                    <p class="leading-tight -tracking-0.01 mb-6">
                                        You can return to the homepage.
                                    </p>
                                    <Link
                                        href="/"
                                        class="rounded-3.5 transition-all duration-300 inline-block font-medium text-base leading-normal -tracking-0.01 whitespace-normal no-underline py-1.5 px-5 mb-16 border border-solid select-none bg-dark border-dark text-white hover:shadow-btnPrimary hover:text-white focus:shadow-btnPrimary focus:text-white active:shadow-btnPrimary active:text-white disabled:bg-grey disabled:opacity-50 disabled:border-grey disabled:border-opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none focus:outline-none dark:text-yellow"
                                    >
                                        Go home
                                    </Link>
                                    <EmptyState
                                        src="/404.png"
                                        maxWidth="550px"
                                        maxHeight="330px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
    },
});
export default P404View;
