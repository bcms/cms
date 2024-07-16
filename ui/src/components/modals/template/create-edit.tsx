import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';
import { TextAreaInput } from '@thebcms/selfhosted-ui/components/inputs/text-area';
import { Toggle } from '@thebcms/selfhosted-ui/components/inputs/toggle';

export interface ModalTemplateCreateEditInput {
    templateId?: string;
}

export const ModalTemplateCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalTemplateCreateEditInput, void>(),
    setup(props) {
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
                            return 'Label is required';
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
                            return `Template with name "${value}" already exists`;
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
                        notification.success('Template created successfully');
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error('Failed to create template');
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
                    templateToUpdate ? 'Update template' : `Create new template`
                }
                handler={props.handler}
                doneText={templateToUpdate.value ? 'Update' : 'Create'}
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={'Label'}
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        placeholder={'My new template'}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={'Description'}
                        value={inputs.value.description.value}
                        error={inputs.value.description.error}
                        placeholder={'What is this template used for'}
                        onInput={(value) => {
                            inputs.value.description.value = value;
                        }}
                    />
                    <Toggle
                        label={'Single entry'}
                        description={`This template will be able to have only 1 entry.`}
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
