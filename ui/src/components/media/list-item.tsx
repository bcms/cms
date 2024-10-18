import { defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import { MediaPreview } from '@bcms/selfhosted-ui/components/media-preview';

export const MediaListItem = defineComponent({
    props: {
        ...DefaultComponentProps,
        item: {
            type: Object as PropType<Media>,
            required: true,
        },
    },
    emits: {
        click: (_media: Media, _event?: MouseEvent) => true,
    },
    setup(props, ctx) {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;

        return () => (
            <li
                class={`flex flex-col bg-white dark:bg-darkGray self-start transition-shadow duration-300 hover:shadow-inputHover focus-within:shadow-inputHover rounded-3xl shadow-input overflow-hidden`}
            >
                {props.item.type === 'DIR' ? (
                    <button
                        class={`w-full flex gap-4 items-center`}
                        onClick={(event) => {
                            ctx.emit('click', props.item, event);
                        }}
                    >
                        <Icon
                            src={`/folder`}
                            class={`text-dark stroke-current w-6 h-6 relative z-20 my-5 ml-5 flex-shrink-0 flex dark:text-light`}
                        />
                        <span class={`truncate`}>{props.item.name}</span>
                        <button
                            class={`group p-5 flex ml-auto bg-white relative z-20 flex-shrink-0 rounded-br-3xl dark:bg-darkGrey rounded-t-3xl disabled:cursor-not-allowed`}
                            onClick={async (event) => {
                                event.stopPropagation();
                                if (
                                    await confirm(
                                        'Delete folder',
                                        'Are you sure you want to delete this folder? All files inside of it will also be deleted',
                                    )
                                ) {
                                    await throwable(
                                        async () => {
                                            await sdk.media.deleteById({
                                                mediaIds: [props.item._id],
                                            });
                                        },
                                        async () => {
                                            notification.success(
                                                'Folder successfully deleted',
                                            );
                                        },
                                    );
                                }
                            }}
                        >
                            <Icon
                                src={`/trash`}
                                class={`w-6 h-6 text-dark fill-current transition-colors duration-300 group-hover:text-red group-focus-visible:text-red group-disabled:text-grey dark:text-light`}
                            />
                        </button>
                    </button>
                ) : (
                    <button
                        class={`w-full flex flex-col items-center`}
                        onClick={(event) => {
                            ctx.emit('click', props.item, event);
                        }}
                    >
                        <div
                            class={`relative w-full flex flex-col items-center justify-center`}
                        >
                            <MediaPreview
                                thumbnail
                                class={`w-full h-[180px] object-cover`}
                                media={props.item}
                            />
                            <div
                                class={`absolute bottom-0 right-0 p-2 text-xs text-white bg-dark/50 rounded-tl-2xl`}
                            >
                                {props.item.mimetype}
                            </div>
                        </div>
                        <div class={`flex gap-2 w-full items-center p-4`}>
                            <span class={`truncate`}>{props.item.name}</span>
                            <button
                                class={`group flex ml-auto bg-white relative z-20 flex-shrink-0 rounded-br-3xl dark:bg-darkGrey rounded-t-3xl disabled:cursor-not-allowed`}
                                onClick={async (event) => {
                                    event.stopPropagation();
                                    if (
                                        await confirm(
                                            'Delete file',
                                            'Are you sure you want to delete this file?',
                                        )
                                    ) {
                                        await throwable(
                                            async () => {
                                                await sdk.media.deleteById({
                                                    mediaIds: [props.item._id],
                                                });
                                            },
                                            async () => {
                                                notification.success(
                                                    'File successfully deleted',
                                                );
                                            },
                                        );
                                    }
                                }}
                            >
                                <Icon
                                    src={`/trash`}
                                    class={`w-6 h-6 text-dark fill-current transition-colors duration-300 group-hover:text-red group-focus-visible:text-red group-disabled:text-grey dark:text-light`}
                                />
                            </button>
                        </div>
                    </button>
                )}
            </li>
        );
    },
});
