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
import type { Group } from '@thebcms/selfhosted-backend/group/models/main';

export interface ModalGroupCreateEditInput {
    groupId?: string;
}

export const ModalGroupCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalGroupCreateEditInput, void>(),
    setup(props) {
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
                            return 'Label is required';
                        }
                        if (
                            sdk.store.group
                                .items()
                                .filter(
                                    (e) => e._id !== groupToUpdate.value?._id,
                                )
                                .find((e) => e.label === value)
                        ) {
                            return `Group with name "${value}" already exists`;
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
                }
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                const isOk = await throwable(
                    async () => {
                        await sdk.group.create({
                            desc: inputs.value.description.value,
                            label: inputs.value.label.value,
                        });
                    },
                    async () => {
                        notification.success('Group created successfully');
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error('Failed to create group');
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
                title={`Create new group`}
                handler={props.handler}
                doneText={'Create'}
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={'Label'}
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        placeholder={'My new group'}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={'Description'}
                        value={inputs.value.description.value}
                        error={inputs.value.description.error}
                        placeholder={'What is this group used for'}
                        onInput={(value) => {
                            inputs.value.description.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
