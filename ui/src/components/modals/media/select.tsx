import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@thebcms/selfhosted-ui/components/modals/_wrapper';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import {
    Breadcrumb,
    type BreadcrumbItem,
} from '@thebcms/selfhosted-ui/components/breadcrumb';
import { MediaPreview } from '@thebcms/selfhosted-ui/components/media-preview';
import { prettyFileSize } from '@thebcms/selfhosted-ui/util/file';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export interface ModalMediaSelectInput {
    mediaId?: string;
    altText?: string;
    caption?: string;
}

export interface ModalMediaSelectOutput {
    media: Media;
    altText: string;
    caption: string;
}

export const ModalMediaSelect = defineComponent({
    props: getModalDefaultProps<
        ModalMediaSelectInput,
        ModalMediaSelectOutput
    >(),
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const notification = window.bcms.notification;

        const data = ref<ModalMediaSelectInput>({});
        const dirId = ref('');
        const searchTerm = ref('');
        let searchDebouce: NodeJS.Timeout | undefined = undefined;
        const mediaData = computed(() => {
            const medias = sdk.store.media.findMany(
                (e) => e.parentId === dirId.value,
            );
            const output: {
                dirs: Media[];
                files: Media[];
                breadcrumb: BreadcrumbItem[];
            } = {
                dirs: [],
                files: [],
                breadcrumb: [
                    {
                        text: 'Home',
                        icon: '/home',
                        onClick() {
                            dirId.value = '';
                        },
                    },
                ],
            };
            for (let i = 0; i < medias.length; i++) {
                if (medias[i].type === 'DIR') {
                    output.dirs.push(medias[i]);
                } else {
                    output.files.push(medias[i]);
                }
            }
            if (dirId.value) {
                let breadcrumbLoop = true;
                const items: BreadcrumbItem[] = [];
                let media = sdk.store.media.findById(dirId.value);
                while (breadcrumbLoop) {
                    if (!media) {
                        breadcrumbLoop = false;
                    } else {
                        items.push({
                            text: media.name,
                            onClick() {
                                if (media) {
                                    dirId.value = media._id;
                                }
                            },
                        });
                        if (media.parentId) {
                            media = sdk.store.media.findById(media.parentId);
                        } else {
                            media = null;
                        }
                    }
                }
                output.breadcrumb.push(...items.reverse());
            }
            output.dirs.sort((a, b) =>
                a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
            );
            output.files.sort((a, b) =>
                a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
            );
            return output;
        });

        function getSelectedMediaPreview(mediaId: string) {
            const media = sdk.store.media.findById(mediaId);
            if (!media) {
                return '';
            }
            return (
                <div class={`flex gap-4`}>
                    <MediaPreview
                        class={`flex-shrink-0 w-32 h-32 rounded-2.5 overflow-hidden`}
                        media={media}
                        thumbnail
                    />
                    <div>
                        <div class={`font-medium text-sm`}>{media.name}</div>
                        <div class={`text-sm`}>
                            {prettyFileSize(media.size)}
                        </div>
                    </div>
                </div>
            );
        }

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                }
                throwable(async () => {
                    await sdk.media.getAll();
                }).catch((err) => console.error(err));
            };
            handler._onDone = async () => {
                if (!data.value.mediaId) {
                    notification.error('Please select a media file');
                    return [false, null as never];
                }
                const media = sdk.store.media.findById(data.value.mediaId);
                if (!media) {
                    notification.error(
                        'Internal error: failed to find selected media',
                    );
                    return [false, null as never];
                }
                return [
                    true,
                    {
                        media,
                        altText: data.value.altText || '',
                        caption: data.value.caption || '',
                    },
                ];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={`Media picker`}
                handler={props.handler}
                doneText={'Done'}
            >
                <div class={`flex flex-col gap-4`}>
                    <TextInput
                        id={'media-search'}
                        placeholder="Search"
                        class="mt-4"
                        focus
                        value={searchTerm.value}
                        onInput={(value) => {
                            clearTimeout(searchDebouce);
                            searchDebouce = setTimeout(() => {
                                searchTerm.value = value.toLowerCase();
                            });
                        }}
                    />
                    <div
                        class={`flex gap-2 border-b border-b-gray-200 dark:border-b-gray-800 pb-4`}
                    >
                        <Button>Upload file</Button>
                        <Button kind={`secondary`}>Create a new folder</Button>
                    </div>
                    {mediaData.value.breadcrumb.length > 0 && (
                        <Breadcrumb items={mediaData.value.breadcrumb} />
                    )}
                    <div class={`flex flex-col gap-2`}>
                        {mediaData.value.dirs.map((media) => {
                            return (
                                <button
                                    class={`flex gap-2 items-center p-3 rounded border border-gray/50 dark:border-gray bg-light dark:bg-darkGray w-full`}
                                    onClick={() => {
                                        dirId.value = media._id;
                                    }}
                                >
                                    <div class={`text-dark dark:text-light`}>
                                        <Icon
                                            class={`w-6 h-6 fill-current`}
                                            src="/folder"
                                        />
                                    </div>
                                    <div class={`font-medium text-sm truncate`}>
                                        {media.name}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {data.value.mediaId
                        ? getSelectedMediaPreview(data.value.mediaId)
                        : ''}
                    <div class={`grid grid-cols-5`}>
                        {mediaData.value.files.map((media) => {
                            return (
                                <button
                                    class={`relative w-15 h-15 p-1 rounded-2.5 border-2 ${
                                        media._id === data.value.mediaId
                                            ? `border-brand`
                                            : `border-white dark:border-gray-700`
                                    }`}
                                    onDblclick={async () => {
                                        if (props.handler) {
                                            const [isOk, outputData] =
                                                await props.handler._onDone();
                                            if (isOk) {
                                                props.handler?.close(
                                                    true,
                                                    outputData,
                                                );
                                            }
                                        }
                                    }}
                                    onClick={() => {
                                        data.value.mediaId = media._id;
                                    }}
                                >
                                    <MediaPreview
                                        class={`w-full h-full rounded`}
                                        imageClass={`rounded`}
                                        media={media}
                                        doNotOpenOnClick
                                        thumbnail
                                    />
                                    {media._id === data.value.mediaId && (
                                        <div
                                            class={`absolute top-0.5 right-0.5 p-0.5 bg-white rounded-full text-green`}
                                        >
                                            <Icon
                                                class={`w-2.5 h-2.5 fill-current`}
                                                src={`/checkmark`}
                                            />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </ModalWrapper>
        );
    },
});
