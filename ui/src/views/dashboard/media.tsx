import { computed, defineComponent, onMounted } from 'vue';
import { useMedia } from '@thebcms/selfhosted-ui/hooks/media';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { EmptyState } from '@thebcms/selfhosted-ui/components/empty-state';
import { Breadcrumb } from '@thebcms/selfhosted-ui/components/media/breadcrumb';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { MediaList } from '@thebcms/selfhosted-ui/components/media/list';
import { useRoute, useRouter } from 'vue-router';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';

export const MediaView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const modal = window.bcms.modalService;
        const route = useRoute();
        const router = useRouter();

        const {
            mediaData,
            mediaSortDirection,
            setMediaSort,
            setMediaParent,
            mediaActiveParent,
            searchMedia,
        } = useMedia();
        const isEmpty = computed(() => sdk.store.media.items().length === 0);

        onMounted(async () => {
            if (typeof route.query.parentId === 'string') {
                setMediaParent(route.query.parentId);
            }
        });

        async function setActiveDir(media?: Media) {
            if (media) {
                await router.replace(`/d/media?parentId=${media._id}`);
            } else {
                await router.replace(`/d/media`);
            }
            setMediaParent(media?._id);
        }

        function sortFilesComponent() {
            return (
                <button
                    onClick={() => {
                        setMediaSort((mediaSortDirection.value * -1) as 1 | -1);
                    }}
                    class="flex items-center transition-colors duration-300 group text-dark hover:text-opacity-60 focus-visible:text-opacity-60 dark:text-light"
                >
                    <span class="text-xs leading-normal uppercase mr-1.5">
                        Name
                    </span>
                    <div
                        class={
                            mediaSortDirection.value === 1 ? 'rotate-180' : ''
                        }
                    >
                        <Icon
                            src="/arrow/up"
                            class="w-3 h-3 transition-colors duration-300 fill-current"
                        />
                    </div>
                </button>
            );
        }

        return () => (
            <div class={`min-h-full desktop:pb-15 desktop:pt-0`}>
                <header class="flex flex-wrap justify-between mb-15">
                    <div class="relative flex border-b border-dark transition-colors duration-300 mb-5 w-full max-w-[500px] min-w-[250px] hover:border-green focus-within:border-green sm:mr-5 dark:border-light dark:hover:border-yellow dark:focus-within:border-yellow">
                        <Icon
                            src={`/search`}
                            class="absolute top-1/2 left-0 -translate-y-1/2 w-[18px] mr-2.5 text-dark fill-current dark:text-light"
                        />
                        <input
                            class="w-full py-2.5 pl-[35px] text-base outline-none bg-transparent dark:text-light"
                            type="text"
                            placeholder="Search"
                            onInput={(event) => {
                                const el = event.target as HTMLInputElement;
                                if (el) {
                                    searchMedia(el.value);
                                }
                            }}
                        />
                    </div>
                    <div class={`flex gap-2`}>
                        <Button
                            onClick={() => {
                                modal.handlers.mediaCreateFile.open();
                            }}
                        >
                            Upload file
                        </Button>
                        <Button
                            kind={'secondary'}
                            class={`ml-5`}
                            onClick={() => {
                                modal.handlers.mediaCreateDir.open();
                            }}
                        >
                            Create new folder
                        </Button>
                    </div>
                </header>
                {isEmpty.value ? (
                    <>
                        <div class={`mt-20 text-2xl text-center`}>
                            There are no files yet. Upload the first one.
                        </div>
                        <EmptyState
                            src="/media.png"
                            maxWidth="350px"
                            maxHeight="315px"
                            class="mt-20 md:absolute md:bottom-32 md:right-32"
                        />
                    </>
                ) : (
                    <div class={`mt-15 pb-7.5`}>
                        <div class={`flex items-center justify-between`}>
                            {mediaActiveParent.value ? (
                                <Breadcrumb
                                    onClick={async (media) => {
                                        await setActiveDir(media);
                                    }}
                                />
                            ) : (
                                <div class="flex flex-col space-y-5">
                                    <h1 class="text-9.5 -tracking-0.03 leading-none dark:text-light">
                                        Media manager
                                    </h1>
                                </div>
                            )}
                            {sortFilesComponent()}
                        </div>
                        <MediaList
                            class={`mt-10`}
                            items={mediaData.value.dirs}
                            onClick={async (media) => {
                                await setActiveDir(media);
                            }}
                        />
                        <MediaList
                            class={`mt-10`}
                            items={mediaData.value.files}
                        />
                    </div>
                )}
            </div>
        );
    },
});

export default MediaView;
