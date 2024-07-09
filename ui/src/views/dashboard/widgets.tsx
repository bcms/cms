import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { EntityList } from '@thebcms/selfhosted-ui/components/entity-list';
import { EmptyState } from '@thebcms/selfhosted-ui/components/empty-state';

export const WidgetsView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const route = useRoute();
        const widgets = computed(() => sdk.store.widget.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.widget.getAll();
            });
        });

        function createNew() {
            modal.handlers.widgetCreateEdit.open();
        }

        return () => (
            <div>
                {widgets.value.length > 0 ? (
                    <>
                        <div class={`flex gap-2`}>
                            <h1 class={`font-medium text-xl`}>Widgets</h1>
                            <div class={`ml-auto`}>
                                <Button onClick={createNew}>
                                    <div class={`flex gap-2 items-center`}>
                                        <div>Create new widget</div>
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
                            items={widgets.value.map((widget) => {
                                return {
                                    name: widget.label,
                                    updatedAt: widget.updatedAt,
                                    href: `${route.path}/${widget._id}`,
                                };
                            })}
                        />
                    </>
                ) : (
                    <EmptyState
                        src="/widgets.png"
                        maxWidth="335px"
                        maxHeight="320px"
                        class="mt-20 md:absolute md:bottom-32 md:right-32"
                        title={'Widget'}
                        subtitle={'There are no widgets.'}
                        clickHandler={createNew}
                        ctaText={'Create new widget'}
                    />
                )}
            </div>
        );
    },
});

export default WidgetsView;
