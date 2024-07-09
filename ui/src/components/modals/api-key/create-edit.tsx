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
import { TextAreaInput } from '@thebcms/selfhosted-ui/components/inputs/text-area';
import type { ApiKey } from '@thebcms/selfhosted-backend/api-key/models/main';

export interface ModalApiKeyCreateEditInput {
    apiKeyId?: string;
}

export const ModalApiKeyCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalApiKeyCreateEditInput, void>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const apiKeyToUpdate = ref<ApiKey>();
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs(apiKey?: ApiKey) {
            return {
                name: createValidationItem({
                    value: apiKey?.name || '',
                    handler(value) {
                        if (!value) {
                            return 'Name is required';
                        }
                        if (
                            sdk.store.apiKey
                                .items()
                                .filter(
                                    (e) => e._id !== apiKeyToUpdate.value?._id,
                                )
                                .find((e) => e.name === value)
                        ) {
                            return `API Key with name "${value}" already exists`;
                        }
                    },
                }),
                description: createValidationItem({
                    value: apiKey?.desc || '',
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                inputs.value = getInputs();
                if (event?.data && event.data.apiKeyId) {
                    const apiKeyId = event.data.apiKeyId;
                    throwable(
                        async () => {
                            await sdk.apiKey.getAll();
                            return sdk.apiKey.get({ apiKeyId });
                        },
                        async (apiKey) => {
                            apiKeyToUpdate.value = apiKey;
                            inputs.value = getInputs(apiKey);
                        },
                    ).catch((err) => console.error(err));
                }
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                const isOk = await throwable(
                    async () => {
                        if (apiKeyToUpdate.value) {
                            await sdk.apiKey.update({
                                _id: apiKeyToUpdate.value._id,
                                desc: inputs.value.description.value,
                                name: inputs.value.name.value,
                            });
                        } else {
                            await sdk.apiKey.create({
                                desc: inputs.value.description.value,
                                name: inputs.value.name.value,
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
                title={`Create new API Key`}
                handler={props.handler}
                doneText={apiKeyToUpdate.value ? 'Update' : 'Create'}
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={'Name'}
                        value={inputs.value.name.value}
                        error={inputs.value.name.error}
                        placeholder={'My key name'}
                        onInput={(value) => {
                            inputs.value.name.value = value;
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
                </div>
            </ModalWrapper>
        );
    },
});
