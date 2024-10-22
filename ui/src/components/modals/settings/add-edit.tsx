import { computed, defineComponent, ref } from 'vue';
import Modal from '../_modal';
import type { BCMSAddEditUserModalInputData } from '@ui/types';
import { BCMSJwtRoleName, type BCMSUser } from '@becomes/cms-sdk/types';
import { createRefValidator, createValidationItem } from '@ui/util';
import { BCMSPasswordInput, BCMSSelect, BCMSTextInput } from '@ui/components';

const component = defineComponent({
  setup() {
    const show = ref(false);
    const throwable = window.bcms.util.throwable;
    const store = window.bcms.vue.store;
    const modalData = ref<BCMSAddEditUserModalInputData>({});
    const userToUpdate = computed(() =>
      store.getters.user_findOne((e) => e._id === modalData.value.userId),
    );

    const inputs = ref(getInputs());
    const inputsValid = createRefValidator(inputs);

    function getInputs(user?: BCMSUser) {
      return {
        firstName: createValidationItem({
          value: user?.customPool.personal.firstName || '',
          handler(value) {
            if (!value) {
              return 'First name is required';
            }
          },
        }),
        lastName: createValidationItem({
          value: user?.customPool.personal.lastName || '',
          handler(value) {
            if (!value) {
              return 'Last name is required';
            }
          },
        }),
        role: createValidationItem<BCMSJwtRoleName>({
          value: user?.roles[0].name || BCMSJwtRoleName.USER,
          handler(value) {
            if (!value) {
              return 'Role is required';
            }
          },
        }),
        email: createValidationItem({
          value: user?.email || '',
          handler(value) {
            if (!value) {
              return 'Email is required';
            }
            if (
              value !== userToUpdate.value?.email &&
              store.getters.user_findOne((e) => e.email === value)
            ) {
              return `User with email "${value}" already exists`;
            }
          },
        }),
        password: createValidationItem({
          value: '',
          handler(value) {
            if (userToUpdate.value) {
              if (value) {
                if (value.length < 8) {
                  return 'Password must be at least 8 characters long';
                }
              }
            } else {
              if (!value) {
                return 'Password is required';
              }
              if (value.length < 8) {
                return 'Password must be at least 8 characters long';
              }
            }
          },
        }),
      };
    }

    window.bcms.modal.settings.addEditUser = {
      hide() {
        show.value = false;
      },
      show(data) {
        modalData.value = data;
        throwable(
          async () => {
            const users = await window.bcms.sdk.user.getAll();
            return {
              user: data.userId
                ? users.find((e) => e._id === data.userId)
                : undefined,
            };
          },
          async (result) => {
            inputs.value = getInputs(result.user);
            show.value = true;
          },
        );
      },
    };

    function cancel() {
      if (modalData.value.onCancel) {
        const result = modalData.value.onCancel();
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error(error);
          });
        }
      }
      window.bcms.modal.settings.addEditUser.hide();
    }

    async function done() {
      if (!inputsValid()) {
        return;
      }
      await throwable(
        async () => {
          if (userToUpdate.value) {
            await window.bcms.sdk.user.update({
              _id: userToUpdate.value._id,
              email: inputs.value.email.value,
              lastName: inputs.value.lastName.value,
              firstName: inputs.value.firstName.value,
              password: inputs.value.password.value,
              role: inputs.value.role.value,
            });
          } else {
            await window.bcms.sdk.user.create({
              email: inputs.value.email.value,
              lastName: inputs.value.lastName.value,
              firstName: inputs.value.firstName.value,
              password: inputs.value.password.value,
              role: inputs.value.role.value,
            });
          }
        },
        async () => {
          if (modalData.value.onDone) {
            const result = modalData.value.onDone();
            if (result instanceof Promise) {
              result.catch((error) => {
                console.error(error);
              });
            }
          }
          window.bcms.modal.settings.addEditUser.hide();
        },
      );
    }

    return () => {
      return (
        <Modal
          title={
            modalData.value.title ||
            (userToUpdate.value ? 'Update user' : 'Add user')
          }
          show={show.value}
          onDone={done}
          onCancel={cancel}
          actionName={userToUpdate.value ? 'Update' : 'Create'}
        >
          <div class={`flex flex-col gap-4`}>
            <BCMSTextInput
              label={'First name'}
              placeholder={'First name'}
              value={inputs.value.firstName.value}
              invalidText={inputs.value.firstName.error}
              onInput={(value) => {
                inputs.value.firstName.value = value;
              }}
            />
            <BCMSTextInput
              label={'Last name'}
              placeholder={'Last name'}
              value={inputs.value.lastName.value}
              invalidText={inputs.value.lastName.error}
              onInput={(value) => {
                inputs.value.lastName.value = value;
              }}
            />
            <BCMSTextInput
              label={'Email'}
              placeholder={'Email'}
              value={inputs.value.email.value}
              invalidText={inputs.value.email.error}
              onInput={(value) => {
                inputs.value.email.value = value;
              }}
            />
            <BCMSPasswordInput
              label={'Password'}
              placeholder={'Password'}
              value={inputs.value.password.value}
              invalidText={inputs.value.password.error}
              helperText={`User will use this password to login`}
              onInput={(value) => {
                inputs.value.password.value = value;
              }}
            />
            <BCMSSelect
              label={`Role`}
              placeholder={`Select role`}
              selected={inputs.value.role.value}
              options={[
                {
                  label: 'Admin',
                  value: 'ADMIN',
                },
                {
                  label: 'User',
                  value: 'USER',
                },
              ]}
              onChange={(option) => {
                if (option.value) {
                  inputs.value.role.value = option.value as BCMSJwtRoleName;
                }
              }}
            />
          </div>
        </Modal>
      );
    };
  },
});
export default component;
