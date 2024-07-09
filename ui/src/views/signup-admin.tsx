import { defineComponent, onMounted, ref } from 'vue';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import { PasswordInput } from '@thebcms/selfhosted-ui/components/inputs/password';
import { useRouter } from 'vue-router';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { throwable } from '@thebcms/selfhosted-ui/util/throwable';

export const SignupAdminView = defineComponent({
    setup() {
        const router = useRouter();
        const inputs = ref({
            firstName: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'First name is required';
                    }
                },
            }),
            lastName: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Last name is required';
                    }
                },
            }),
            email: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Email is required';
                    }
                },
            }),
            password: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Password is required';
                    } else if (value.length < 8) {
                        return 'Password must be at least 8 characters long';
                    }
                },
            }),
            serverToken: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return 'Server token is required';
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
                <h1 class={`font-normal text-4xl`}>Create admin user</h1>
                <TextInput
                    class={`mt-10`}
                    label="First name"
                    value={inputs.value.firstName.value}
                    error={inputs.value.firstName.error}
                    onInput={(value) => {
                        inputs.value.firstName.value = value;
                    }}
                />
                <TextInput
                    class={`mt-4`}
                    label="Last name"
                    value={inputs.value.lastName.value}
                    error={inputs.value.lastName.error}
                    onInput={(value) => {
                        inputs.value.lastName.value = value;
                    }}
                />
                <TextInput
                    class={`mt-4`}
                    label="Email"
                    value={inputs.value.email.value}
                    error={inputs.value.email.error}
                    onInput={(value) => {
                        inputs.value.email.value = value;
                    }}
                />
                <PasswordInput
                    class={`mt-4`}
                    label="Password"
                    value={inputs.value.password.value}
                    error={inputs.value.password.error}
                    onInput={(value) => {
                        inputs.value.password.value = value;
                    }}
                />
                <PasswordInput
                    class={`mt-4`}
                    label="Server token"
                    description={`Can be found in server logs when starting the BCMS for the first time`}
                    value={inputs.value.serverToken.value}
                    error={inputs.value.serverToken.error}
                    onInput={(value) => {
                        inputs.value.serverToken.value = value;
                    }}
                />
                <Button class={`mt-10 mr-auto`} onClick={signup}>
                    Sign up
                </Button>
            </div>
        );
    },
});
export default SignupAdminView;
