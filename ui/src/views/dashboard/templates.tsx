import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import { EntityList } from '@bcms/selfhosted-ui/components/entity-list';
import { EmptyState } from '@bcms/selfhosted-ui/components/empty-state';
import { useI18n } from 'vue-i18n';

export const TemplatesView = defineComponent({
    setup() {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const route = useRoute();
        const templates = computed(() => sdk.store.template.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.template.getAll();
            });
        });

        function createNew() {
            modal.handlers.templateCreateEdit.open();
        }

        return () => (
            <div>
                {templates.value.length > 0 ? (
                    <>
                        <div class={`flex gap-2`}>
                            <h1 class={`font-medium text-xl`}>
                                {t('routes.templates')}
                            </h1>
                            <div class={`ml-auto`}>
                                <Button onClick={createNew}>
                                    <div class={`flex gap-2 items-center`}>
                                        <div>
                                            {t(
                                                'modals.template.createTitle',
                                            )}
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
                            items={templates.value.map((template) => {
                                return {
                                    name: template.label,
                                    desc: template.desc,
                                    updatedAt: template.updatedAt,
                                    href: `${route.path}/${template._id}`,
                                };
                            })}
                        />
                    </>
                ) : (
                    <EmptyState
                        src="/templates.png"
                        maxWidth="335px"
                        maxHeight="320px"
                        class="mt-20 md:absolute md:bottom-32 md:right-32"
                        title={t('routes.template')}
                        subtitle={t('views.templates.empty')}
                        clickHandler={createNew}
                        ctaText={t('modals.template.createTitle')}
                    />
                )}
            </div>
        );
    },
});

export default TemplatesView;
