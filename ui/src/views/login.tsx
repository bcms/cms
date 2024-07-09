import { defineComponent, onMounted, ref } from 'vue';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import { PasswordInput } from '@thebcms/selfhosted-ui/components/inputs/password';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { throwable } from '@thebcms/selfhosted-ui/util/throwable';
import { useRoute, useRouter } from 'vue-router';

export const LoginView = defineComponent({
    setup() {
        const router = useRouter();
        const route = useRoute();

        const inputs = ref({
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
                        return 'Email is required';
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
                <h1 class={`font-normal text-4xl`}>Log in</h1>
                <TextInput
                    class={`mt-10`}
                    label="Email"
                    value={inputs.value.email.value}
                    error={inputs.value.email.error}
                    onInput={(value) => {
                        inputs.value.email.value = value;
                    }}
                    onEnter={login}
                />
                <PasswordInput
                    class={`mt-4`}
                    label="Password"
                    value={inputs.value.password.value}
                    error={inputs.value.password.error}
                    onInput={(value) => {
                        inputs.value.password.value = value;
                    }}
                    onEnter={login}
                />
                <Button class={`mt-10 mr-auto`} onClick={login}>
                    Log in
                </Button>
            </div>
        );
    },
});
