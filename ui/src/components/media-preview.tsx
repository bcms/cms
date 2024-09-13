import {
    defineComponent,
    onBeforeUpdate,
    onMounted,
    type PropType,
    ref,
} from 'vue';
import { Buffer } from 'buffer';
import { createQueue, type Queue } from '@thebcms/selfhosted-utils/queue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import {
    type Media,
    MediaType,
} from '@thebcms/selfhosted-backend/media/models/main';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';
import { bufferToFile } from '@thebcms/selfhosted-ui/util/file';

const loadQueue: {
    [mediaId: string]: Queue<void>;
} = {};

export const MediaPreview = defineComponent({
    props: {
        ...DefaultComponentProps,
        media: {
            type: Object as PropType<Media>,
            required: true,
        },
        thumbnail: Boolean,
        doNotOpenOnClick: Boolean,
        imageClass: String,
        altText: String,
        caption: String,
    },
    setup(props) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const typesWithImage: Array<keyof typeof MediaType> = [
            'IMG',
            'GIF',
            'VID',
            'SVG',
        ];
        const typesWithThumbnail: Array<keyof typeof MediaType> = [
            'IMG',
            'VID',
        ];
        const src = ref('');
        let oldMediaId = '';
        const loading = ref(false);

        async function loadSrc() {
            if (typesWithImage.includes(props.media.type)) {
                if (!loadQueue[props.media._id]) {
                    loadQueue[props.media._id] = createQueue();
                }
                await loadQueue[props.media._id]({
                    name: 'load',
                    handler: async () => {
                        await throwable(
                            async () => {
                                return sdk.media.bin({
                                    media: props.media,
                                    data: {
                                        thumbnail: typesWithThumbnail.includes(
                                            props.media.type,
                                        )
                                            ? props.thumbnail
                                            : false,
                                    },
                                });
                            },
                            async (buffer) => {
                                src.value = `data:${
                                    props.media.mimetype
                                };base64,${Buffer.from(buffer).toString(
                                    'base64',
                                )}`;
                            },
                        );
                    },
                }).wait;
            }
        }

        onMounted(async () => {
            oldMediaId = props.media._id;
            await loadSrc();
        });

        onBeforeUpdate(async () => {
            if (oldMediaId !== props.media._id) {
                oldMediaId = props.media._id;
                await loadSrc();
            }
        });

        async function openMedia() {
            if (!props.doNotOpenOnClick) {
                loading.value = true;
                await throwable(
                    async () => {
                        return sdk.media.bin({
                            media: props.media,
                            data: {},
                        });
                    },
                    async (buffer) => {
                        const fileObjectURL = URL.createObjectURL(
                            bufferToFile(
                                props.media.name,
                                props.media.mimetype,
                                buffer,
                            ),
                        );
                        window.open(fileObjectURL, '_blank');
                    },
                );
                loading.value = false;
            }
        }

        return () => (
            <div
                id={props.id}
                style={props.style}
                class={props.class}
                bcms-media-data={JSON.stringify(props.media)}
                title={`${props.media.name}${
                    props.media.width !== -1
                        ? `\nWidth: ${props.media.width}px`
                        : ''
                }${
                    props.media.height !== -1
                        ? `\nHeight: ${props.media.height}px`
                        : ''
                }${
                    props.media.altText || props.altText
                        ? `\nAlt text: ${props.altText || props.media.altText}`
                        : ''
                }${
                    props.caption || props.media.caption
                        ? `\nCaption: ${props.caption || props.media.caption}`
                        : ''
                }`}
            >
                {typesWithImage.includes(props.media.type) && src.value ? (
                    <button
                        class={`relative w-full h-full`}
                        onClick={openMedia}
                    >
                        <img
                            class={`absolute object-cover w-full h-full blur-md ${
                                props.imageClass || ''
                            }`}
                            src={src.value}
                            alt={props.media.name}
                        />
                        <img
                            class={`relative object-contain w-full h-full ${
                                props.imageClass || ''
                            }`}
                            src={src.value}
                            alt={props.media.name}
                        />
                    </button>
                ) : (
                    <button
                        onClick={openMedia}
                        class={`w-full h-full flex items-center justify-center`}
                    >
                        <Icon
                            class={`text-dark dark:text-white fill-current w-8 h-8`}
                            src={'/file'}
                        />
                    </button>
                )}
                <Loader show={loading.value} />
            </div>
        );
    },
});
