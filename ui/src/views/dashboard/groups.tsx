import { computed, defineComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import { EntityList } from '@bcms/selfhosted-ui/components/entity-list';
import { EmptyState } from '@bcms/selfhosted-ui/components/empty-state';

export const GroupsView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const route = useRoute();
        const groups = computed(() => sdk.store.group.items());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.group.getAll();
            });
        });

        function createNew() {
            modal.handlers.groupCreateEdit.open();
        }

        return () => (
            <div>
                {groups.value.length > 0 ? (
                    <>
                        <div class={`flex gap-2`}>
                            <h1 class={`font-medium text-xl`}>Groups</h1>
                            <div class={`ml-auto`}>
                                <Button onClick={createNew}>
                                    <div class={`flex gap-2 items-center`}>
                                        <div>Create new group</div>
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
                            items={groups.value.map((group) => {
                                return {
                                    name: group.label,
                                    updatedAt: group.updatedAt,
                                    href: `${route.path}/${group._id}`,
                                    desc: group.desc,
                                };
                            })}
                        />
                    </>
                ) : (
                    <EmptyState
                        src="/groups.png"
                        maxWidth="335px"
                        maxHeight="320px"
                        class="mt-20 md:absolute md:bottom-32 md:right-32"
                        title={'Group'}
                        subtitle={'There are no groups.'}
                        clickHandler={createNew}
                        ctaText={'Create new group'}
                    />
                )}
            </div>
        );
    },
});

export default GroupsView;
