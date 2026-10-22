import { defineComponent } from 'vue';
import { BgAuth } from '@bcms/selfhosted-ui/components/bg-auth';
import { BCMSLogo } from '@bcms/selfhosted-ui/components/logo';
import { UiLanguageSwitch } from '@bcms/selfhosted-ui/components/ui-language-switch';

export const AuthLayout = defineComponent({
    setup(_, ctx) {
        return () => (
            <div
                class={`relative min-w-screen min-h-screen text-dark flex flex-col items-center`}
            >
                <BgAuth />
                <UiLanguageSwitch class={`absolute top-6 right-6 z-50`} />
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
