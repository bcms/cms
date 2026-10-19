import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import { EntityList } from '@bcms/selfhosted-ui/components/entity-list';
import { EmptyState } from '@bcms/selfhosted-ui/components/empty-state';
import { Tag } from '@bcms/selfhosted-ui/components/tag';
import { useI18n } from 'vue-i18n';

export const ApiKeysView = defineComponent({
    setup() {
        const { t } = useI18n();
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
                            <h1 class={`font-medium text-xl`}>
                                {t('routes.apiKeys')}
                            </h1>
                            <div class={`ml-auto`}>
                                <Button onClick={createNew}>
                                    <div class={`flex gap-2 items-center`}>
                                        <div>
                                            {t('modals.apiKey.createTitle')}
                                        </div>
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
                                    slot: () => (
                                        <div class={`flex gap-2 items-center`}>
                                            <div>{apiKey.name}</div>
                                            {apiKey.blocked ? (
                                                <Tag danger>
                                                    {t(
                                                        'views.apiKeys.blocked',
                                                    )}
                                                </Tag>
                                            ) : (
                                                ''
                                            )}
                                        </div>
                                    ),
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
                        title={t('routes.apiKeys')}
                        subtitle={t('views.apiKeys.empty')}
                        clickHandler={createNew}
                        ctaText={t('modals.apiKey.createTitle')}
                    />
                )}
            </div>
        );
    },
});

export default ApiKeysView;
