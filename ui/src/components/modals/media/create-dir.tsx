import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import {
    createRefValidator,
    createValidationItem,
} from '@thebcms/selfhosted-ui/util/validation';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import { useMedia } from '@thebcms/selfhosted-ui/hooks/media';
import type { ModalHandlerOptions } from '@thebcms/selfhosted-ui/services/modal';

export const ModalMediaCreateDir = defineComponent({
    props: getModalDefaultProps<void, void>(),
    setup(props) {
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
                        return 'Name is required';
                    }
                    if (sameLevelMedia.value.find((e) => e.name === value)) {
                        return `Folder with name "${value}" already exists`;
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
                        title: 'Create new folder',
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
                        notification.success('Folder successfully created');
                        return true;
                    },
                    async (err) => {
                        console.error(err);
                        notification.error(
                            'There was an error creating folder',
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
                doneText={'Create'}
            >
                <div>
                    <TextInput
                        label={'Folder name'}
                        value={inputs.value.name.value}
                        error={inputs.value.name.error}
                        placeholder={'Name'}
                        onInput={(value) => {
                            inputs.value.name.value = value;
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
