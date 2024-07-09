import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { EntityList } from '@thebcms/selfhosted-ui/components/entity-list';
import { EmptyState } from '@thebcms/selfhosted-ui/components/empty-state';

export const ApiKeysView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const route = useRoute();
        const apiKeys = computed(() => sdk.store.apiKey.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.apiKey.getAll();
            });
        });

        function createNew() {
            modal.handlers.apiKeyCreateEdit.open();
        }

        return () => (
            <div>
                {apiKeys.value.length > 0 ? (
                    <>
                        <div class={`flex gap-2`}>
                            <h1 class={`font-medium text-xl`}>API Keys</h1>
                            <div class={`ml-auto`}>
                                <Button onClick={createNew}>
                                    <div class={`flex gap-2 items-center`}>
                                        <div>Create new API Key</div>
                                        <div>
                                            <Icon
                                                class={`w-4 h-4 text-white fill-current`}
                                                src={'/plus'}
                                            />
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </div>
                        <EntityList
                            class={`mt-[45px] max-w-[530px]`}
                            items={apiKeys.value.map((apiKey) => {
                                return {
                                    name: apiKey.name,
                                    desc: apiKey.desc,
                                    updatedAt: apiKey.updatedAt,
                                    href: `${route.path}/${apiKey._id}`,
                                };
                            })}
                        />
                    </>
                ) : (
                    <EmptyState
                        src="/keys.png"
                        maxWidth="335px"
                        maxHeight="320px"
                        class="mt-20 md:absolute md:bottom-32 md:right-32"
                        title={'API Keys'}
                        subtitle={'There are no API Keys.'}
                        clickHandler={createNew}
                        ctaText={'Create new API Key'}
                    />
                )}
            </div>
        );
    },
});

export default ApiKeysView;
