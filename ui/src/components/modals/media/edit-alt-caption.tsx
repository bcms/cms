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
                title={'Update media'}
                handler={props.handler}
                doneText={'Update'}
            >
                <div class={`flex flex-col gap-4`}>
                    <TextInput
                        label={'Alt text'}
                        placeholder={'Alt text'}
                        value={inputs.value.altText.value}
                        error={inputs.value.altText.error}
                        onInput={(value) => {
                            inputs.value.altText.value = value;
                        }}
                    />
                    <TextAreaInput
                        label={'Caption'}
                        placeholder={'Caption'}
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
