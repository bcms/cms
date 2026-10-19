import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import { TextAreaInput } from '@bcms/selfhosted-ui/components/inputs/text-area';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import { useI18n } from 'vue-i18n';

export interface ModalGroupCreateEditInput {
    groupId?: string;
}

export const ModalGroupCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalGroupCreateEditInput, void>(),
    setup(props) {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const groupToUpdate = ref<Group>();
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs(group?: Group) {
            return {
                label: createValidationItem({
                    value: group?.label || '',
                    handler(value) {
                        if (!value) {
                            return t('modals.common.labelRequired');
                        }
                        if (
                            sdk.store.group
                                .items()
                                .filter(
                                    (e) => e._id !== groupToUpdate.value?._id,
                                )
                                .find((e) => e.label === value)
                        ) {
                            return t('modals.group.nameExists', {
                                name: value,
                            });
                        }
                    },
                }),
                description: createValidationItem({
                    value: group?.desc || '',
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                inputs.value = getInputs();
                if (event?.data && event.data.groupId) {
                    const groupId = event.data.groupId;
                    throwable(
                        async () => {
                            await sdk.group.getAll();
                            return sdk.group.get({ groupId });
                        },
                        async (group) => {
                            groupToUpdate.value = group;
                            inputs.value = getInputs(group);
                        },
                    ).catch((err) => console.error(err));
                } else {
                    groupToUpdate.value = undefined;
                    inputs.value = getInputs();
                }
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                const isOk = await throwable(
                    async () => {
                        if (groupToUpdate.value) {
                            await sdk.group.update({
                                _id: groupToUpdate.value._id,
                                desc: inputs.value.description.value,
                                label: inputs.value.label.value,
                            });
                        } else {
                            await sdk.group.create({
                                desc: inputs.value.description.value,
                                label: inputs.value.label.value,
                            });
                        }
                    },
                    async () => {
                        notification.success(t('modals.group.created'));
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error(t('modals.group.createFailed'));
                        return false;
                    },
                );
                return [isOk, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={
                    groupToUpdate.value
                        ? t('modals.group.updateTitle')
                        : t('modals.group.createTitle')
                }
                handler={props.handler}
                doneText={
                    groupToUpdate.value
                        ? t('modals.common.update')
                        : t('modals.common.create')
                }
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={t('modals.common.label')}
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        placeholder={t('modals.group.labelPlaceholder')}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={t('modals.common.description')}
                        value={inputs.value.description.value}
                        error={inputs.value.description.error}
                        placeholder={t('modals.group.descPlaceholder')}
                        onInput={(value) => {
                            inputs.value.description.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
