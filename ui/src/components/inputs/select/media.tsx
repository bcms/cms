import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    type PropType,
} from 'vue';
import {
    InputProps,
    InputWrapper,
} from '@thebcms/selfhosted-ui/components/inputs/_wrapper';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';
import {
    callAndClearUnsubscribeFns,
    type UnsubscribeFns,
} from '@thebcms/selfhosted-ui/util/sub';
import { MediaPreview } from '@thebcms/selfhosted-ui/components/media-preview';
import { prettyFileSize } from '@thebcms/selfhosted-ui/util/file';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export const MediaSelect = defineComponent({
    props: {
        ...InputProps,
        mediaId: {
            type: String,
            required: true,
        },
        altText: String,
        caption: String,
        entrySync: Object as PropType<EntrySync>,
    },
    emits: {
        change: (
            _data?: { media: Media; altText: string; caption: string },
            _triggeredByEntrySync?: boolean,
        ) => {
            return true;
        },
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;

        const media = computed(() => sdk.store.media.findById(props.mediaId));
        const unsubs: UnsubscribeFns = [];

        onMounted(async () => {
            if (props.entrySync && props.id) {
                unsubs.push(
                    props.entrySync.onMediaUpdate(props.id, async (data) => {
                        if (typeof data.value !== 'undefined') {
                            const mediaItem = sdk.store.media.findById(
                                data.value._id,
                            );
                            if (mediaItem) {
                                ctx.emit(
                                    'change',
                                    {
                                        media: mediaItem,
                                        altText: data.value.alt_text || '',
                                        caption: data.value.caption || '',
                                    },
                                    true,
                                );
                            } else {
                                ctx.emit('change', undefined, true);
                            }
                        }
                    }),
                );
            }
            await throwable(async () => {
                await sdk.media.getAll();
            });
        });

        onBeforeUnmount(() => {
            callAndClearUnsubscribeFns(unsubs);
        });

        return () => (
            <InputWrapper
                id={props.id}
                style={props.style}
                class={props.class}
                error={props.error}
                required={props.required}
                description={props.description}
                label={props.label}
            >
                <div
                    class={`border bg-light dark:bg-darkGray ${
                        props.error
                            ? 'border-red'
                            : `border-gray/50 dark:border-gray`
                    } rounded-2.5`}
                >
                    <button
                        class={`w-full flex flex-col xs:flex-row gap-2`}
                        onClick={() => {
                            modal.handlers.mediaSelect.open({
                                data: {
                                    mediaId: media.value?._id || '',
                                    altText: media.value?.altText || '',
                                    caption: media.value?.caption || '',
                                },
                                onDone(data) {
                                    ctx.emit('change', {
                                        media: data.media,
                                        altText: data.altText,
                                        caption: data.caption,
                                    });
                                },
                            });
                        }}
                    >
                        {media.value ? (
                            <div class={`relative flex flex-col xs:flex-row gap-4 px-6 py-4 w-full`}>
                                <MediaPreview
                                    class={`flex-shrink-0 w-24 h-24 rounded-2.5 overflow-hidden`}
                                    media={media.value}
                                    doNotOpenOnClick
                                    thumbnail
                                />
                                <div class={`flex flex-col gap-1 text-left`}>
                                    <div class={`font-medium text-sm`}>
                                        {media.value.name}
                                    </div>
                                    <div class={`text-sm`}>
                                        {prettyFileSize(media.value.size)}
                                    </div>
                                    <div
                                        class={`flex gap-2 mt-auto text-brand-700 font-medium`}
                                    >
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                            }}
                                        >
                                            Edit media
                                        </button>
                                        <div>Click to select another media</div>
                                    </div>
                                </div>
                                <div
                                    class={`flex gap-2 top-2 right-2 mb-auto ml-auto`}
                                >
                                    <button
                                        class={`stroke-brand-700 p-1`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            window.open(
                                                `/d/media${
                                                    media.value?.parentId
                                                        ? `?parentId=${media.value.parentId}`
                                                        : ''
                                                }`,
                                                '_blank',
                                            );
                                        }}
                                    >
                                        <Icon
                                            class={`w-5 h-5 text-dark dark:text-white fill-current`}
                                            src={`/link`}
                                        />
                                    </button>
                                    <button
                                        class={`stroke-error-700 p-1`}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            ctx.emit('change');
                                        }}
                                    >
                                        <Icon
                                            class={`w-5 h-5 text-dark dark:text-white fill-current`}
                                            src={`/trash`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                class={`flex flex-col items-center justify-center px-6 py-4 w-full gap-3`}
                            >
                                <div
                                    class={`stroke-gray-600 p-3 rounded border border-gray-100`}
                                >
                                    <Icon
                                        class={`w-5 h-5 text-dark dark:text-white fill-current`}
                                        src={`/cloud`}
                                    />
                                </div>
                                <div class={`font-bold text-brand-700`}>
                                    Click to select a media file
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </InputWrapper>
        );
    },
});
