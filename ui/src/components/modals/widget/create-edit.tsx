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
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';

export interface ModalWidgetCreateEditInput {
    widgetId?: string;
}

export const ModalWidgetCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalWidgetCreateEditInput, void>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const widgetToUpdate = ref<Widget>();
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs(widget?: Widget) {
            return {
                label: createValidationItem({
                    value: widget?.label || '',
                    handler(value) {
                        if (!value) {
                            return 'Label is required';
                        }
                        if (
                            sdk.store.widget
                                .items()
                                .filter(
                                    (e) => e._id !== widgetToUpdate.value?._id,
                                )
                                .find((e) => e.label === value)
                        ) {
                            return `Widget with name "${value}" already exists`;
                        }
                    },
                }),
                description: createValidationItem({
                    value: widget?.desc || '',
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                inputs.value = getInputs();
                if (event?.data && event.data.widgetId) {
                    const widgetId = event.data.widgetId;
                    throwable(
                        async () => {
                            await sdk.widget.getAll();
                            return sdk.widget.get({ widgetId });
                        },
                        async (widget) => {
                            widgetToUpdate.value = widget;
                            inputs.value = getInputs(widget);
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
                        if (widgetToUpdate.value) {
                            await sdk.widget.update({
                                _id: widgetToUpdate.value._id,
                                desc: inputs.value.description.value,
                                label: inputs.value.label.value,
                            });
                        } else {
                            await sdk.widget.create({
                                desc: inputs.value.description.value,
                                label: inputs.value.label.value,
                            });
                        }
                    },
                    async () => {
                        notification.success('Widget created successfully');
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error('Failed to create widget');
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
                title={`Create new widget`}
                handler={props.handler}
                doneText={widgetToUpdate.value ? 'Update' : 'Create'}
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={'Label'}
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        placeholder={'My new widget'}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={'Description'}
                        value={inputs.value.description.value}
                        error={inputs.value.description.error}
                        placeholder={'What is this widget used for'}
                        onInput={(value) => {
                            inputs.value.description.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
