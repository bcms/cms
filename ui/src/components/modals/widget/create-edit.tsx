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
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import { useI18n } from 'vue-i18n';

export interface ModalWidgetCreateEditInput {
    widgetId?: string;
}

export const ModalWidgetCreateEdit = defineComponent({
    props: getModalDefaultProps<ModalWidgetCreateEditInput, void>(),
    setup(props) {
        const { t } = useI18n();
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
                            return t('modals.common.labelRequired');
                        }
                        if (
                            sdk.store.widget
                                .items()
                                .filter(
                                    (e) => e._id !== widgetToUpdate.value?._id,
                                )
                                .find((e) => e.label === value)
                        ) {
                            return t('modals.widget.nameExists', {
                                name: value,
                            });
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
                } else {
                    widgetToUpdate.value = undefined;
                    inputs.value = getInputs();
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
                        notification.success(t('modals.widget.created'));
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error(t('modals.widget.createFailed'));
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
                    widgetToUpdate.value
                        ? t('modals.widget.updateTitle')
                        : t('modals.widget.createTitle')
                }
                handler={props.handler}
                doneText={
                    widgetToUpdate.value
                        ? t('modals.common.update')
                        : t('modals.common.create')
                }
            >
                <div class={`flex flex-col gap-8`}>
                    <TextInput
                        label={t('modals.common.label')}
                        value={inputs.value.label.value}
                        error={inputs.value.label.error}
                        placeholder={t('modals.widget.labelPlaceholder')}
                        onInput={(value) => {
                            inputs.value.label.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={t('modals.common.description')}
                        value={inputs.value.description.value}
                        error={inputs.value.description.error}
                        placeholder={t('modals.widget.descPlaceholder')}
                        onInput={(value) => {
                            inputs.value.description.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
