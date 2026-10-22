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
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import { TextAreaInput } from '@bcms/selfhosted-ui/components/inputs/text-area';
import { Toggle } from '@bcms/selfhosted-ui/components/inputs/toggle';
import { useI18n } from 'vue-i18n';

export interface ModalTemplateCreateEditInput {
    templateId?: string;
}

export const ModalTemplateCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalTemplateCreateEditInput, void>(),
    setup(props) {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const templateToUpdate = ref<Template>();
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs(template?: Template) {
            return {
                label: createValidationItem({
                    value: template?.label || '',
                    handler(value) {
                        if (!value) {
                            return t('modals.common.labelRequired');
                        }
                        if (
                            sdk.store.template
                                .items()
                                .filter(
                                    (e) =>
                                        e._id !== templateToUpdate.value?._id,
                                )
                                .find((e) => e.label === value)
                        ) {
                            return t('modals.template.nameExists', {
                                name: value,
                            });
                        }
                    },
                }),
                description: createValidationItem({
                    value: template?.desc || '',
                }),
                singleEntry: createValidationItem({
                    value: template?.singleEntry || false,
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                inputs.value = getInputs();
                if (event?.data && event.data.templateId) {
                    const templateId = event.data.templateId;
                    throwable(
                        async () => {
                            await sdk.template.getAll();
                            return sdk.template.get({ templateId });
                        },
                        async (template) => {
                            templateToUpdate.value = template;
                            inputs.value = getInputs(template);
                        },
                    ).catch((err) => console.error(err));
                } else {
                    templateToUpdate.value = undefined;
                    inputs.value = getInputs();
                }
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                const isOk = await throwable(
                    async () => {
                        if (templateToUpdate.value) {
                            await sdk.template.update({
                                _id: templateToUpdate.value._id,
                                desc: inputs.value.description.value,
                                label: inputs.value.label.value,
                                singleEntry: inputs.value.singleEntry.value,
                            });
                        } else {
                            await sdk.template.create({
                                desc: inputs.value.description.value,
                                label: inputs.value.label.value,
                                singleEntry: inputs.value.singleEntry.value,
                            });
                        }
                    },
                    async () => {
                        notification.success(t('modals.template.created'));
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error(
                            t('modals.template.createFailed'),
                        );
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
                    templateToUpdate.value
                        ? t('modals.template.updateTitle')
                        : t('modals.template.createTitle')
                }
                handler={props.handler}
                doneText={
                    templateToUpdate.value
                        ? t('modals.common.update')
                        : t('modals.common.create')
                }
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={t('modals.common.label')}
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        placeholder={t('modals.template.labelPlaceholder')}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={t('modals.common.description')}
                        value={inputs.value.description.value}
                        error={inputs.value.description.error}
                        placeholder={t('modals.template.descPlaceholder')}
                        onInput={(value) => {
                            inputs.value.description.value = value;
                        }}
                    />
                    <Toggle
                        label={t('modals.template.singleEntry')}
                        description={t('modals.template.singleEntryDesc')}
                        value={inputs.value.singleEntry.value}
                        error={inputs.value.singleEntry.error}
                        onInput={(value) => {
                            inputs.value.singleEntry.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
