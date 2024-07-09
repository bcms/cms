import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import type { UserRoleName } from '@thebcms/selfhosted-backend/user/models/role';
import { PasswordInput } from '@thebcms/selfhosted-ui/components/inputs/password';
import { Select } from '@thebcms/selfhosted-ui/components/inputs/select/main';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';
import { FileInput } from '@thebcms/selfhosted-ui/components/inputs/file';
import { fileToB64 } from '@thebcms/selfhosted-ui/util/file';

export interface ModalUserAddEditInput {
    userId?: string;
}

export const ModalUserAddEdit = defineComponent({
    props: getModalDefaultProps<ModalUserAddEditInput, void>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const data = ref<ModalUserAddEditInput>({});
        const me = computed(() => sdk.store.user.methods.me());
        const userToUpdate = computed(() =>
            sdk.store.user.findById(data.value.userId || '_'),
        );
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs(user?: UserProtected) {
            return {
                avatar: createValidationItem<{ file?: File; fileB64?: string }>(
                    {
                        value: {
                            fileB64: user?.customPool.personal.avatarUri || '',
                        },
                    },
                ),
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
                role: createValidationItem<UserRoleName>({
                    value: user?.roles[0].name || 'USER',
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
                            sdk.store.user.find((e) => e.email === value)
                        ) {
                            console.log(sdk.store.user.items());
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

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                }
                inputs.value = getInputs();
                throwable(
                    async () => {
                        await sdk.user.getAll();
                        if (event?.data && event.data.userId) {
                            return await sdk.user.get(event.data.userId);
                        }
                    },
                    async (user) => {
                        if (user) {
                            inputs.value = getInputs(user);
                        }
                    },
                ).catch((err) => console.error(err));
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                await throwable(
                    async () => {
                        let user: UserProtected;
                        if (userToUpdate.value) {
                            user = await sdk.user.update({
                                _id: userToUpdate.value?._id,
                                customPool: {
                                    personal: {
                                        firstName: inputs.value.firstName.value,
                                        lastName: inputs.value.lastName.value,
                                    },
                                },
                                role: inputs.value.role.value,
                                email: inputs.value.email.value,
                                password: inputs.value.password.value,
                            });
                        } else {
                            user = await sdk.user.create({
                                role: inputs.value.role.value,
                                email: inputs.value.email.value,
                                firstName: inputs.value.firstName.value,
                                lastName: inputs.value.lastName.value,
                                password: inputs.value.password.value,
                            });
                        }
                        if (inputs.value.avatar.value.file) {
                            await sdk.user.uploadAvatar({
                                userId: user._id,
                                file: inputs.value.avatar.value.file,
                            });
                        }
                    },
                    async () => {
                        notification.success('User added successfully');
                    },
                );
                return [true, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={userToUpdate.value ? 'Edit user' : 'Add user'}
                handler={props.handler}
                doneText={userToUpdate.value ? 'Update' : 'Add'}
            >
                <div class={`flex flex-col gap-4`}>
                    <FileInput
                        label="Avatar"
                        accept="image/*"
                        src={inputs.value.avatar.value.fileB64}
                        onInput={async (files) => {
                            inputs.value.avatar.value.file = files[0];
                            inputs.value.avatar.value.fileB64 = await fileToB64(
                                files[0],
                            );
                        }}
                    />
                    <TextInput
                        label={'First name'}
                        value={inputs.value.firstName.value}
                        error={inputs.value.firstName.error}
                        placeholder={'John'}
                        onInput={(value) => {
                            inputs.value.firstName.value = value;
                        }}
                    />
                    <TextInput
                        label={'Last name'}
                        value={inputs.value.lastName.value}
                        error={inputs.value.lastName.error}
                        placeholder={'Smith'}
                        onInput={(value) => {
                            inputs.value.lastName.value = value;
                        }}
                    />
                    {userToUpdate.value &&
                        me.value?._id !== userToUpdate.value?._id && (
                            <Select
                                label={'Role'}
                                selected={inputs.value.role.value}
                                error={inputs.value.role.error}
                                options={[
                                    {
                                        value: 'USER',
                                        label: 'User',
                                    },
                                    {
                                        value: 'ADMIN',
                                        label: 'Admin',
                                    },
                                ]}
                                onChange={(option) => {
                                    if (option) {
                                        inputs.value.role.value =
                                            option.value as UserRoleName;
                                    }
                                }}
                            />
                        )}
                    <TextInput
                        label={'Email'}
                        value={inputs.value.email.value}
                        error={inputs.value.email.error}
                        placeholder={'john.smith@example.com'}
                        onInput={(value) => {
                            inputs.value.email.value = value;
                        }}
                    />
                    <PasswordInput
                        label={userToUpdate.value ? 'New password' : 'Password'}
                        value={inputs.value.password.value}
                        error={inputs.value.password.error}
                        description={
                            userToUpdate.value
                                ? `Leave empty if you don't want to change their password`
                                : ''
                        }
                        placeholder={'Password'}
                        onInput={(value) => {
                            inputs.value.password.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
