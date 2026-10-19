import { defineComponent, onMounted, ref } from 'vue';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import { PasswordInput } from '@bcms/selfhosted-ui/components/inputs/password';
import { useRouter } from 'vue-router';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { throwable } from '@bcms/selfhosted-ui/util/throwable';
import { useI18n } from 'vue-i18n';

export const SignupAdminView = defineComponent({
    setup() {
        const { t } = useI18n();
        const router = useRouter();
        const inputs = ref({
            firstName: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return t('auth.firstNameRequired');
                    }
                },
            }),
            lastName: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return t('auth.lastNameRequired');
                    }
                },
            }),
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
                    } else if (value.length < 8) {
                        return t('auth.passwordMinLength');
                    }
                },
            }),
            serverToken: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return t('auth.serverTokenRequired');
                    }
                },
            }),
        });
        const inputsValid = createRefValidator(inputs);

        async function signup() {
            if (!inputsValid()) {
                return;
            }
            await throwable(
                async () => {
                    return await window.bcms.sdk.auth.signUpAdmin({
                        firstName: inputs.value.firstName.value,
                        lastName: inputs.value.lastName.value,
                        email: inputs.value.email.value,
                        password: inputs.value.password.value,
                        serverToken: inputs.value.serverToken.value,
                    });
                },
                async () => {
                    await router.replace('/d');
                },
            );
        }

        onMounted(async () => {
            await throwable(async () => {
                if (!(await window.bcms.sdk.auth.shouldSignUp())) {
                    await router.replace('/');
                }
            });
        });

        return () => (
            <div class={`flex-col`}>
                <h1 class={`font-normal text-4xl`}>
                    {t('auth.createAdminUser')}
                </h1>
                <TextInput
                    class={`mt-10`}
                    label={t('auth.firstName')}
                    value={inputs.value.firstName.value}
                    error={inputs.value.firstName.error}
                    onInput={(value) => {
                        inputs.value.firstName.value = value;
                    }}
                />
                <TextInput
                    class={`mt-4`}
                    label={t('auth.lastName')}
                    value={inputs.value.lastName.value}
                    error={inputs.value.lastName.error}
                    onInput={(value) => {
                        inputs.value.lastName.value = value;
                    }}
                />
                <TextInput
                    class={`mt-4`}
                    label={t('auth.email')}
                    value={inputs.value.email.value}
                    error={inputs.value.email.error}
                    onInput={(value) => {
                        inputs.value.email.value = value;
                    }}
                />
                <PasswordInput
                    class={`mt-4`}
                    label={t('auth.password')}
                    value={inputs.value.password.value}
                    error={inputs.value.password.error}
                    onInput={(value) => {
                        inputs.value.password.value = value;
                    }}
                />
                <PasswordInput
                    class={`mt-4`}
                    label={t('auth.serverToken')}
                    description={t('auth.serverTokenDescription')}
                    value={inputs.value.serverToken.value}
                    error={inputs.value.serverToken.error}
                    onInput={(value) => {
                        inputs.value.serverToken.value = value;
                    }}
                />
                <Button class={`mt-10 mr-auto`} onClick={signup}>
                    {t('auth.signUp')}
                </Button>
            </div>
        );
    },
});
export default SignupAdminView;
