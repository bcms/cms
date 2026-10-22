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
import { useI18n } from 'vue-i18n';

export interface ModalMediaEditAltCaptionInput {
    altText?: string;
    caption?: string;
}

export interface ModalMediaEditAltCaptionOutput {
    altText?: string;
    caption?: string;
}

export const ModalMediaEditAltCaption = defineComponent({
    props: getModalDefaultProps<
        ModalMediaEditAltCaptionInput,
        ModalMediaEditAltCaptionOutput
    >(),
    setup(props) {
        const { t } = useI18n();
        const data = ref<ModalMediaEditAltCaptionInput>({});
        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs(input?: ModalMediaEditAltCaptionInput) {
            return {
                altText: createValidationItem({
                    value: input?.altText || '',
                }),
                caption: createValidationItem({
                    value: input?.caption || '',
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                    inputs.value = getInputs(event.data);
                } else {
                    data.value = {};
                    inputs.value = getInputs();
                }
            };
            handler._onDone = async () => {
                return [
                    inputsValid(),
                    {
                        altText: inputs.value.altText.value,
                        caption: inputs.value.caption.value,
                    },
                ];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={t('modals.mediaEdit.updateTitle')}
                handler={props.handler}
                doneText={t('modals.common.update')}
            >
                <div class={`flex flex-col gap-4`}>
                    <TextInput
                        label={t('modals.mediaEdit.altText')}
                        placeholder={t('modals.mediaEdit.altText')}
                        value={inputs.value.altText.value}
                        error={inputs.value.altText.error}
                        onInput={(value) => {
                            inputs.value.altText.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={t('modals.mediaEdit.caption')}
                        placeholder={t('modals.mediaEdit.caption')}
                        value={inputs.value.caption.value}
                        error={inputs.value.caption.error}
                        onInput={(value) => {
                            inputs.value.caption.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
