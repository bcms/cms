import { defineComponent } from 'vue';
import { BgAuth } from '@thebcms/selfhosted-ui/components/bg-auth';
import { BCMSLogo } from '@thebcms/selfhosted-ui/components/logo';

export const AuthLayout = defineComponent({
    setup(_, ctx) {
        return () => (
            <div
                class={`min-w-screen min-h-screen text-dark flex flex-col items-center`}
            >
                <BgAuth />
                <div
                    class={`relative flex flex-col items-center w-full max-w-[500px]`}
                >
                    <BCMSLogo class={`mt-36`} />
                    <div
                        class={`mt-36 w-full bg-white dark:bg-dark text-dark dark:text-white rounded-2xl p-10 shadow-input`}
                    >
                        {ctx.slots.default?.()}
                    </div>
                </div>
            </div>
        );
    },
});
