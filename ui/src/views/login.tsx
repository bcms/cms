import { defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createRefValidator, createValidationItem } from '@ui/util';
import { BCMSButton, BCMSPasswordInput, BCMSTextInput } from '@ui/components';

const component = defineComponent({
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
      if (await window.bcms.sdk.isLoggedIn()) {
        await redirect();
      }
      await window.bcms.util.throwable(async () => {
        if (await window.bcms.sdk.auth.shouldSignUp()) {
          await router.replace('/sign-up');
        }
      });
    });

    async function redirect() {
      if (
        typeof route.query.forward === 'string' &&
        route.query.forward.startsWith('/')
      ) {
        await router.replace(route.query.forward);
      }
      await router.replace('/dashboard');
    }

    async function handleSubmit() {
      if (!inputsValid()) {
        return;
      }
      await window.bcms.util.throwable(
        async () => {
          await window.bcms.sdk.auth.login({
            email: inputs.value.email.value,
            password: inputs.value.password.value,
          });
        },
        async () => {
          await router.replace('/dashboard');
        },
      );
    }

    return () => (
      <div
        class={`flex flex-col w-screen h-screen items-center justify-center text-dark dark:text-light`}
      >
        <div class={`relative flex flex-col items-center w-full max-w-[500px]`}>
          <div
            class={`mt-36 w-full bg-white dark:bg-dark text-dark dark:text-white rounded-2xl p-10 shadow-input flex flex-col gap-4`}
          >
            <h1 class={`text-2xl`}>Log in</h1>
            <BCMSTextInput
              label="Email"
              type="email"
              placeholder="me@example.com"
              value={inputs.value.email.value}
              invalidText={inputs.value.email.error}
              onInput={(value) => {
                inputs.value.email.value = value;
              }}
            />
            <BCMSPasswordInput
              label="Password"
              placeholder="********"
              value={inputs.value.password.value}
              invalidText={inputs.value.password.error}
              onInput={(value) => {
                inputs.value.password.value = value;
              }}
            />
            <BCMSButton class={`ml-auto`} onClick={handleSubmit}>
              Log in
            </BCMSButton>
          </div>
        </div>
      </div>
    );
  },
});
export default component;
