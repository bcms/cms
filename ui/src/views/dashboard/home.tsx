import { computed, defineComponent, onMounted, ref } from 'vue';
import { throwable } from '@thebcms/selfhosted-ui/util/throwable';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import type { UserStatsResponse } from '@thebcms/selfhosted-backend/user/models/controller';
import { Link } from '@thebcms/selfhosted-ui/components/link';
import { MediaPreview } from '@thebcms/selfhosted-ui/components/media-preview';
import { UserList } from '@thebcms/selfhosted-ui/components/user-list';
import { userHasRole } from '@thebcms/selfhosted-ui/util/role';

export const HomeView = defineComponent({
    setup() {
        window.bcms.meta.set({ title: 'Home' });
        const sdk = window.bcms.sdk;
        const modal = window.bcms.modalService;

        const loading = ref(true);
        const me = computed(() => sdk.store.user.methods.me());
        const userStats = ref<UserStatsResponse>();
        const recentMedia = computed(() =>
            sdk.store.media
                .items()
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 15),
        );

        function getStatBox(num: number | string, text: string) {
            return (
                <div
                    class={`flex flex-col items-center justify-center text-center border border-green/50 px-3 py-14 rounded-[40px] bg-light/50 dark:border-yellow/30 dark:text-light dark:bg-darkGrey/50`}
                >
                    <div
                        class={`text-[50px] leading-none tracking-[-0.02em] mb-4`}
                    >
                        {num}
                    </div>
                    <div class={`leading-tight tracking-[-0.01em]`}>{text}</div>
                </div>
            );
        }

        onMounted(async () => {
            loading.value = true;
            await throwable(
                async () => {
                    await sdk.user.getAll();
                    await sdk.template.getAll();
                    await sdk.media.getAll();
                    return {
                        stats: await sdk.user.stats(),
                    };
                },
                async (result) => {
                    userStats.value = result.stats;
                },
            );
            loading.value = false;
        });

        return () => (
            <div class={`flex flex-col gap-20 w-full min-h-full max-w-[650px]`}>
                {loading.value ? (
                    <div class={`m-auto`}>
                        <Loader show />
                    </div>
                ) : (
                    <>
                        <div class={`flex gap-4 w-full`}>
                            <div class={`flex flex-col gap-2`}>
                                <div
                                    class={`text-5xl leading-tight font-light tracking-[-0.02em] mb-1 dark:text-light`}
                                >
                                    Hello {me.value?.username},
                                </div>
                                <div>Have a nice day at work!</div>
                            </div>
                            {/*{userHasRole(['ADMIN'], me.value) && (*/}
                            {/*    <Button*/}
                            {/*        class={`ml-auto mb-auto mt-2`}*/}
                            {/*        onClick={() => {}}*/}
                            {/*    >*/}
                            {/*        <div class={`flex gap-2 items-center`}>*/}
                            {/*            <div>Create new</div>*/}
                            {/*            <Icon*/}
                            {/*                class={`w-6 h-6 text-white fill-current`}*/}
                            {/*                src={`/plus`}*/}
                            {/*            />*/}
                            {/*        </div>*/}
                            {/*    </Button>*/}
                            {/*)}*/}
                        </div>
                        <div class={`flex flex-col gap-2`}>
                            <div
                                class={`text-[28px] leading-tight tracking-[-0.01em] mb-10 dark:text-light`}
                            >
                                Your stats
                            </div>
                            <div
                                class={`grid grid-cols-1 gap-5 desktop:grid-cols-[repeat(3,minmax(200px,1fr))] desktop:max-w-max`}
                            >
                                {getStatBox(
                                    userStats.value?.entryCount || 0,
                                    'Entries created',
                                )}
                                {getStatBox(
                                    (
                                        (userStats.value?.mediaSize || 0) /
                                        1000000
                                    ).toFixed(0),
                                    'Megabytes upload',
                                )}
                                {getStatBox(
                                    sdk.store.user.items().length,
                                    'Members',
                                )}
                            </div>
                        </div>
                        <div class="max-w-[500px]">
                            <div class="flex items-center justify-between mb-10">
                                <h2 class="text-[28px] leading-tight tracking-[-0.01em] dark:text-light">
                                    Recently uploaded
                                </h2>
                                {recentMedia.value.length > 0 && (
                                    <Link
                                        href="/d/media"
                                        class="leading-tight tracking-[-0.01em] text-green hover:underline dark:text-yellow"
                                    >
                                        See all files
                                    </Link>
                                )}
                            </div>
                            {recentMedia.value.length > 0 ? (
                                <div class="grid grid-cols-5 gap-2.5">
                                    {recentMedia.value.map((media, index) => {
                                        return (
                                            <Link
                                                href={`/d/media?search=${media._id}`}
                                                class="flex aspect-square w-full max-h-20"
                                            >
                                                <MediaPreview
                                                    thumbnail
                                                    key={index}
                                                    media={media}
                                                    class="p-0.5 w-full h-full  object-cover"
                                                />
                                            </Link>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div>
                                    {userHasRole(['ADMIN'], me.value) && (
                                        <Button
                                            class="mb-6"
                                            onClick={() => {
                                                modal.handlers.mediaCreateFile.open();
                                            }}
                                        >
                                            Upload files
                                        </Button>
                                    )}
                                    <div class="leading-tight tracking-[-0.01em] mb-8 dark:text-light">
                                        Upload first files to see them here.
                                    </div>
                                </div>
                            )}
                        </div>
                        <UserList class={`w-full`} />
                    </>
                )}
            </div>
        );
    },
});
export default HomeView;
