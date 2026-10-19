import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import type { UserRoleName } from '@bcms/selfhosted-backend/user/models/role';
import { PasswordInput } from '@bcms/selfhosted-ui/components/inputs/password';
import { Select } from '@bcms/selfhosted-ui/components/inputs/select/main';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import { FileInput } from '@bcms/selfhosted-ui/components/inputs/file';
import { fileToB64 } from '@bcms/selfhosted-ui/util/file';
import { useI18n } from 'vue-i18n';

export interface ModalUserAddEditInput {
    userId?: string;
}

export const ModalUserAddEdit = defineComponent({
    props: getModalDefaultProps<ModalUserAddEditInput, void>(),
    setup(props) {
        const { t } = useI18n();
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
                            return t('modals.user.firstNameRequired');
                        }
                    },
                }),
                lastName: createValidationItem({
                    value: user?.customPool.personal.lastName || '',
                    handler(value) {
                        if (!value) {
                            return t('modals.user.lastNameRequired');
                        }
                    },
                }),
                role: createValidationItem<UserRoleName>({
                    value: user?.roles[0].name || 'USER',
                    handler(value) {
                        if (!value) {
                            return t('modals.user.roleRequired');
                        }
                    },
                }),
                email: createValidationItem({
                    value: user?.email || '',
                    handler(value) {
                        if (!value) {
                            return t('modals.user.emailRequired');
                        }
                        if (
                            value !== userToUpdate.value?.email &&
                            sdk.store.user.find((e) => e.email === value)
                        ) {
                            console.log(sdk.store.user.items());
                            return t('modals.user.emailExists', {
                                email: value,
                            });
                        }
                    },
                }),
                password: createValidationItem({
                    value: '',
                    handler(value) {
                        if (userToUpdate.value) {
                            if (value) {
                                if (value.length < 8) {
                                    return t(
                                        'modals.user.passwordMinLength',
                                    );
                                }
                            }
                        } else {
                            if (!value) {
                                return t('modals.user.passwordRequired');
                            }
                            if (value.length < 8) {
                                return t('modals.user.passwordMinLength');
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
                } else {
                    data.value = {};
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
                        if (userToUpdate.value) {
                            notification.success(t('modals.user.updated'));
                        } else {
                            notification.success(t('modals.user.added'));
                        }
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
                title={
                    userToUpdate.value
                        ? t('modals.user.editTitle')
                        : t('modals.user.addTitle')
                }
                handler={props.handler}
                doneText={
                    userToUpdate.value
                        ? t('modals.common.update')
                        : t('modals.common.add')
                }
            >
                <div class={`flex flex-col gap-4`}>
                    <FileInput
                        label={t('modals.user.avatar')}
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
                        label={t('modals.user.firstName')}
                        value={inputs.value.firstName.value}
                        error={inputs.value.firstName.error}
                        placeholder={t('modals.user.firstNamePlaceholder')}
                        onInput={(value) => {
                            inputs.value.firstName.value = value;
                        }}
                    />
                    <TextInput
                        label={t('modals.user.lastName')}
                        value={inputs.value.lastName.value}
                        error={inputs.value.lastName.error}
                        placeholder={t('modals.user.lastNamePlaceholder')}
                        onInput={(value) => {
                            inputs.value.lastName.value = value;
                        }}
                    />
                    {userToUpdate.value &&
                        me.value?._id !== userToUpdate.value?._id && (
                            <Select
                                label={t('modals.user.role')}
                                selected={inputs.value.role.value}
                                error={inputs.value.role.error}
                                options={[
                                    {
                                        value: 'USER',
                                        label: t('modals.user.roleUser'),
                                    },
                                    {
                                        value: 'ADMIN',
                                        label: t('modals.user.roleAdmin'),
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
                        label={t('modals.user.email')}
                        value={inputs.value.email.value}
                        error={inputs.value.email.error}
                        placeholder={t('modals.user.emailPlaceholder')}
                        onInput={(value) => {
                            inputs.value.email.value = value;
                        }}
                    />
                    <PasswordInput
                        label={
                            userToUpdate.value
                                ? t('modals.user.newPassword')
                                : t('modals.user.password')
                        }
                        value={inputs.value.password.value}
                        error={inputs.value.password.error}
                        description={
                            userToUpdate.value
                                ? t('modals.user.passwordLeaveEmpty')
                                : ''
                        }
                        placeholder={t('modals.user.password')}
                        onInput={(value) => {
                            inputs.value.password.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
