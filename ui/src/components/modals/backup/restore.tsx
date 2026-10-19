import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { delay } from '@bcms/selfhosted-ui/util/delay';
import {
    FileInput,
    type FileInputListItem,
} from '@bcms/selfhosted-ui/components/inputs/file';
import { useI18n } from 'vue-i18n';

export const ModalBackupRestore = defineComponent({
    props: getModalDefaultProps<void, void>(),
    setup(props) {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;
        const confirm = window.bcms.confirm;

        const inputs = ref(getInputs());
        const inputsValid = createRefValidator(inputs);

        function getInputs() {
            return {
                file: createValidationItem<FileInputListItem | undefined>({
                    value: undefined,
                    handler(value) {
                        if (!value) {
                            return t('modals.backup.selectZip');
                        }
                    },
                }),
            };
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (_event) => {
                inputs.value = getInputs();
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                if (
                    !(await confirm(
                        t('modals.backup.restoreTitle'),
                        t('modals.backup.restoreConfirm'),
                        'continue',
                    ))
                ) {
                    return [false, undefined];
                }
                const isOk = await throwable(
                    async () => {
                        await sdk.backup.restore({
                            file: (inputs.value.file.value as FileInputListItem)
                                .file,
                            onUploadProgress(progress) {
                                progress.total = progress.total || 0;
                                (
                                    inputs.value.file.value as FileInputListItem
                                ).progress = parseInt(
                                    (
                                        (progress.loaded * 100) /
                                        progress.total
                                    ).toFixed(0),
                                );
                            },
                        });
                    },
                    async () => {
                        notification.success(
                            t('modals.backup.restoreSuccessful'),
                        );
                        await delay(2000);
                        window.location.reload();
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error(
                            t('modals.backup.restoreFailed'),
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
                title={t('modals.backup.restoreTitle')}
                handler={props.handler}
            >
                <div class={`flex flex-col gap-8`}>
                    <FileInput
                        label={t('modals.backup.restoreFileLabel')}
                        list={
                            inputs.value.file.value
                                ? [inputs.value.file.value]
                                : []
                        }
                        onInput={(items) => {
                            inputs.value.file.value = {
                                file: items[0],
                                name: items[0].name,
                                progress: 0,
                                id: items[0].name,
                            };
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
