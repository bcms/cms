import { v4 as uuidv4 } from 'uuid';
import { defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import { useMedia } from '@thebcms/selfhosted-ui/hooks/media';
import {
    FileInput,
    type FileInputListItem,
} from '@thebcms/selfhosted-ui/components/inputs/file';
import { fileToB64 } from '@thebcms/selfhosted-ui/util/file';

export const ModalMediaCreateFile = defineComponent({
    props: getModalDefaultProps<void, void>(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const files = ref<FileInputListItem[]>([]);
        const { mediaActiveParent } = useMedia();

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = () => {};
            handler._onDone = async () => {
                await throwable(
                    async () => {
                        for (let i = 0; i < files.value.length; i++) {
                            const fileData = files.value[i];
                            const uploadToken =
                                await sdk.media.requestUploadToken();
                            const media = await sdk.media.createFile({
                                file: fileData.file,
                                name: fileData.name,
                                parentId: mediaActiveParent.value?._id,
                                uploadToken,
                                onUploadProgress(progress) {
                                    progress.total = progress.total || 0;
                                    fileData.progress = parseInt(
                                        (
                                            (progress.loaded * 100) /
                                            progress.total
                                        ).toFixed(0),
                                    );
                                },
                            });
                            if (fileData.altText || fileData.caption) {
                                await sdk.media.update({
                                    _id: media._id,
                                    altText: fileData.altText,
                                    caption: fileData.caption,
                                });
                            }
                        }
                    },
                    async () => {
                        notification.success('Files successfully created');
                    },
                );
                return [true, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={'Upload files'}
                handler={props.handler}
                doneText={'Create'}
            >
                <div>
                    <FileInput
                        list={files.value}
                        onInput={async (inputFiles) => {
                            for (let i = 0; i < inputFiles.length; i++) {
                                files.value.push({
                                    id: uuidv4(),
                                    file: inputFiles[i],
                                    name: inputFiles[i].name,
                                    src: inputFiles[i].type.includes('image/')
                                        ? await fileToB64(inputFiles[i])
                                        : undefined,
                                });
                            }
                        }}
                        onRemoveListItem={(item) => {
                            for (let i = 0; i < files.value.length; i++) {
                                if (files.value[i].id === item.id) {
                                    files.value.splice(i, 1);
                                    break;
                                }
                            }
                        }}
                        onEditListItem={(item) => {
                            for (let i = 0; i < files.value.length; i++) {
                                if (files.value[i].id === item.id) {
                                    files.value[i] = item;
                                    break;
                                }
                            }
                        }}
                    />
                </div>
            </ModalWrapper>
        );
    },
});
