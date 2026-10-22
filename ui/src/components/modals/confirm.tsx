import { defineComponent, onMounted, ref } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import { useI18n } from 'vue-i18n';

export interface ModalConfirmInput {
    title: string;
    content: string | JSX.Element;
    prompt?: string;
}

export const ModalConfirm = defineComponent({
    props: getModalDefaultProps<ModalConfirmInput, void>(),
    setup(props) {
        const { t } = useI18n();
        const data = ref<ModalConfirmInput>({
            title: '',
            content: '',
        });
        const inputs = ref({
            prompt: createValidationItem({
                value: '',
                handler(value) {
                    if (data.value.prompt && data.value.prompt !== value) {
                        return t('validation.promptIncorrect');
                    }
                },
            }),
        });
        const inputsValid = createRefValidator(inputs);

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                    inputs.value.prompt.value = '';
                }
            };
            handler._onDone = async () => {
                return [inputsValid(), undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={data.value.title}
                handler={props.handler}
                doneText={t('common.confirm')}
            >
                <div>
                    <div>{data.value.content}</div>
                    {data.value.prompt && (
                        <TextInput
                            id={`confirm_prompt`}
                            value={inputs.value.prompt.value}
                            error={inputs.value.prompt.error}
                            placeholder={data.value.prompt}
                            description={() => (
                                <p>
                                    {t('confirm.promptPrefix')}
                                    <strong>{data.value.prompt}</strong>
                                    {t('confirm.promptSuffix')}
                                </p>
                            )}
                            onInput={(value) => {
                                inputs.value.prompt.value = value;
                            }}
                        />
                    )}
                </div>
            </ModalWrapper>
        );
    },
});
