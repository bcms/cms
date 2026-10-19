import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@bcms/selfhosted-ui/util/validation';
import { TextInput } from '@bcms/selfhosted-ui/components/inputs/text';
import { useMedia } from '@bcms/selfhosted-ui/hooks/media';
import type { ModalHandlerOptions } from '@bcms/selfhosted-ui/services/modal';
import { useI18n } from 'vue-i18n';

export const ModalMediaCreateDir = defineComponent({
    props: getModalDefaultProps<void, void>(),
    setup(props) {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const data = ref<ModalHandlerOptions<void>>({});
        const { mediaActiveParent } = useMedia();
        const sameLevelMedia = computed(() => {
            return sdk.store.media.items().filter((media) => {
                if (media.type === 'DIR') {
                    if (
                        mediaActiveParent.value &&
                        media.parentId === mediaActiveParent.value?._id
                    ) {
                        return true;
                    } else if (media.isInRoot) {
                        return true;
                    }
                }
                return false;
            });
        });
        const inputs = ref({
            name: createValidationItem({
                value: '',
                handler(value) {
                    if (!value) {
                        return t('modals.mediaDir.nameRequired');
                    }
                    if (sameLevelMedia.value.find((e) => e.name === value)) {
                        return t('modals.mediaDir.nameExists', {
                            name: value,
                        });
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
                } else {
                    data.value = {
                        title: t('modals.mediaDir.createTitle'),
                    };
                }
                inputs.value.name.value = '';
            };
            handler._onDone = async () => {
                if (!inputsValid()) {
                    return [false, undefined];
                }
                const result = await throwable(
                    async () => {
                        await sdk.media.createDir({
                            name: inputs.value.name.value,
                            parentId: mediaActiveParent.value?._id,
                        });
                    },
                    async () => {
                        notification.success(t('modals.mediaDir.created'));
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error(
                            t('modals.mediaDir.createFailed'),
                        );
                        return false;
                    },
                );
                return [result, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={data.value.title}
                handler={props.handler}
                doneText={t('modals.common.create')}
            >
                <div>
                    <TextInput
                        label={t('modals.mediaDir.folderName')}
                        value={inputs.value.name.value}
                        error={inputs.value.name.error}
                        placeholder={t('modals.mediaDir.namePlaceholder')}
                        onInput={(value) => {
                            inputs.value.name.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
