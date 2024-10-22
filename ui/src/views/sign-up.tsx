import { defineComponent, onMounted, ref } from 'vue';
import { BCMSButton, BCMSPasswordInput, BCMSTextInput } from '@ui/components';
import { createRefValidator, createValidationItem } from '@ui/util/validation';
import { useRouter } from 'vue-router';

export const SignUpView = defineComponent({
  setup() {
    const router = useRouter();

    const inputs = ref({
      serverToken: createValidationItem({
        value: '',
        handler(value) {
          if (!value) {
            return 'Server token is required';
          }
        },
      }),
      email: createValidationItem({
        value: '',
        handler(value) {
          if (!value) {
            return 'Email is required';
          }
          const p1 = value.split('@');
          if (p1.length !== 2) {
            return 'Invalid email address';
          }
          const p2 = p1[1].split('.');
          if (p2.length < 2) {
            return 'Invalid email address';
          }
        },
      }),
      password: createValidationItem({
        value: '',
        handler(value) {
          if (!value) {
            return 'Password is required';
          }
        },
      }),
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
    });
    const inputsValid = createRefValidator(inputs);

    async function handleSubmit() {
      if (!inputsValid()) {
        return;
      }
      await window.bcms.util.throwable(
        async () => {
          await window.bcms.sdk.auth.signUpAdmin({
            firstName: inputs.value.firstName.value,
            email: inputs.value.email.value,
            lastName: inputs.value.lastName.value,
            password: inputs.value.password.value,
            serverToken: inputs.value.serverToken.value,
          });
        },
        async () => {
          await router.replace('/dashboard');
        },
      );
    }

    onMounted(async () => {
      if (!(await window.bcms.sdk.auth.shouldSignUp())) {
        await router.replace('/');
      }
    });

    return () => (
      <div
        class={`flex flex-col w-screen h-screen items-center justify-center text-dark dark:text-light`}
      >
        <div class={`relative flex flex-col items-center w-full max-w-[500px]`}>
          <div
            class={`mt-36 w-full bg-white dark:bg-dark text-dark dark:text-white rounded-2xl p-10 shadow-input flex flex-col gap-4`}
          >
            <h1 class={`text-2xl`}>Setup admin user</h1>
            <BCMSTextInput
              label="First name"
              placeholder="First name"
              value={inputs.value.firstName.value}
              invalidText={inputs.value.firstName.error}
              onInput={(value) => {
                inputs.value.firstName.value = value;
              }}
            />
            <BCMSTextInput
              label="Last name"
              placeholder="Last name"
              value={inputs.value.lastName.value}
              invalidText={inputs.value.lastName.error}
              onInput={(value) => {
                inputs.value.lastName.value = value;
              }}
            />
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
            <BCMSPasswordInput
              label="Server token"
              placeholder="********"
              value={inputs.value.serverToken.value}
              invalidText={inputs.value.serverToken.error}
              helperText={`You can find this token in console of the server`}
              onInput={(value) => {
                inputs.value.serverToken.value = value;
              }}
            />
            <BCMSButton class={`ml-auto`} onClick={handleSubmit}>
              Sign up
            </BCMSButton>
          </div>
        </div>
      </div>
    );
  },
});

export default SignUpView;
