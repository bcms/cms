import { defineComponent, onMounted, ref } from 'vue';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { PasswordInput } from '@bcms/selfhosted-ui/components/inputs/password';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { throwable } from '@bcms/selfhosted-ui/util/throwable';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

export const LoginView = defineComponent({
    setup() {
        const { t } = useI18n();
        const router = useRouter();
        const route = useRoute();

        const inputs = ref({
            email: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return t('auth.emailRequired');
                    }
                },
            }),
            password: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return t('auth.passwordRequired');
                    }
                },
            }),
        });
        const inputsValid = createRefValidator(inputs);

        onMounted(async () => {
            await throwable(async () => {
                if (await window.bcms.sdk.auth.shouldSignUp()) {
                    await router.replace('/signup-admin');
                } else if (await window.bcms.sdk.isLoggedIn()) {
                    if (
                        typeof route.query.forward === 'string' &&
                        route.query.forward.startsWith('/')
                    ) {
                        await router.replace(route.query.forward);
                    } else {
                        await router.replace('/d');
                    }
                }
            });
        });

        async function login() {
            if (!inputsValid()) {
                return;
            }
            await throwable(
                async () => {
                    await window.bcms.sdk.auth.login({
                        email: inputs.value.email.value,
                        password: inputs.value.password.value,
                    });
                },
                async () => {
                    if (
                        typeof route.query.forward === 'string' &&
                        route.query.forward.startsWith('/')
                    ) {
                        await router.replace(route.query.forward);
                    } else {
                        await router.replace('/d');
                    }
                },
            );
        }

        return () => (
            <div class={`flex flex-col`}>
                <h1 class={`font-normal text-4xl`}>{t('auth.login')}</h1>
                <TextInput
                    class={`mt-10`}
                    label={t('auth.email')}
                    placeholder={t('auth.email')}
                    value={inputs.value.email.value}
                    error={inputs.value.email.error}
                    onInput={(value) => {
                        inputs.value.email.value = value;
                    }}
                    onEnter={login}
                />
                <PasswordInput
                    class={`mt-4`}
                    label={t('auth.password')}
                    placeholder={t('auth.password')}
                    value={inputs.value.password.value}
                    error={inputs.value.password.error}
                    onInput={(value) => {
                        inputs.value.password.value = value;
                    }}
                    onEnter={login}
                />
                <Button class={`mt-10 mr-auto`} onClick={login}>
                    {t('auth.login')}
                </Button>
            </div>
        );
    },
});
