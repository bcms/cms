import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader } from '@bcms/selfhosted-ui/components/loader';
import { Breadcrumb } from '@bcms/selfhosted-ui/components/breadcrumb';
import {
    Dropdown,
    type DropdownItem,
} from '@bcms/selfhosted-ui/components/dropdown';
import { Button } from '@bcms/selfhosted-ui/components/button';
import { millisToDateString } from '@bcms/selfhosted-ui/util/date';
import { PropList } from '@bcms/selfhosted-ui/components/prop-list';
import type { Group } from '@bcms/selfhosted-backend/group/models/main';
import { useI18n } from 'vue-i18n';

export const GroupView = defineComponent({
    setup() {
        const { t } = useI18n();
        const meta = window.bcms.meta;
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;

        const router = useRouter();
        const route = useRoute();
        const group = computed(() =>
            sdk.store.group.find((e) => e._id === route.params.groupId),
        );

        meta.set({ titleKey: 'routes.group' });

        const loading = ref(true);
        const dropdownItems = computed<DropdownItem[]>(() => [
            {
                text: t('views.detail.editGroup'),
                onClick() {
                    modal.handlers.groupCreateEdit.open({
                        data: {
                            groupId: group.value?._id,
                        },
                    });
                },
            },
            {
                text: t('views.detail.whereIsItUsed'),
                border: true,
                async onClick() {
                    await throwable(
                        async () => {
                            return await sdk.group.whereIsItUsed({
                                groupId: group.value?._id as string,
                            });
                        },
                        async (result) => {
                            modal.handlers.whereIsItUsedResults.open({
                                data: result,
                            });
                        },
                    );
                },
            },
            {
                text: t('common.delete'),
                danger: true,
                async onClick() {
                    if (
                        await confirm(
                            t('views.detail.deleteGroup'),
                            t('views.detail.deleteGroupConfirm'),
                            group.value?.name,
                        )
                    ) {
                        await throwable(
                            async () => {
                                await sdk.group.deleteById({
                                    groupId: group.value?._id || '',
                                });
                            },
                            async () => {
                                notification.success(
                                    t('views.detail.groupDeleted'),
                                );
                                await router.replace('/d/group');
                            },
                        );
                    }
                },
            },
        ]);

        function infoItem(label: string, value: string) {
            return (
                <div class={`flex gap-2 justify-between items-center`}>
                    <div class={`text-gray`}>{label}</div>
                    <div>{value}</div>
                </div>
            );
        }

        async function createProperty() {
            modal.handlers.propCreate.open({
                data: {
                    existingProps: group.value?.props || [],
                },
                async onDone(data) {
                    const grp = group.value as Group;
                    await throwable(
                        async () => {
                            await sdk.group.update({
                                _id: grp._id,
                                propChanges: [
                                    {
                                        add: data.prop,
                                    },
                                ],
                            });
                        },
                        async () => {
                            notification.success(
                                t('views.detail.propertyAdded'),
                            );
                        },
                    );
                },
            });
        }

        onMounted(async () => {
            await throwable(async () => {
                await sdk.template.getAll();
                await sdk.group.getAll();
            });
            loading.value = false;
        });

        return () => (
            <>
                {loading.value || !group.value ? (
                    <div
                        class={`w-full h-full flex items-center justify-center`}
                    >
                        <Loader show />
                    </div>
                ) : (
                    <div
                        class={`w-full flex flex-col gap-4 desktop:justify-center`}
                    >
                        <div class={`flex flex-col sm:flex-row gap-4`}>
                            <Breadcrumb
                                items={[
                                    {
                                        text: t('views.detail.home'),
                                        icon: '/home',
                                        href: '/d',
                                    },
                                    {
                                        text: t('routes.groups'),
                                        href: '/d/group',
                                    },
                                    {
                                        text: group.value.label,
                                    },
                                ]}
                            />
                            <div class={`flex gap-2 ml-auto`}>
                                <Dropdown items={dropdownItems.value} />
                                <Button onClick={createProperty}>
                                    {t('views.detail.addProperty')}
                                </Button>
                            </div>
                        </div>
                        <div
                            class={`flex flex-col desktop:flex-row gap-2 desktop:gep-4 desktop:mt-6`}
                        >
                            <div>
                                <div class={`text-2xl`}>
                                    {group.value.label}
                                </div>
                                <div class={`text-darkGray dark:text-gray`}>
                                    {t(
                                        'views.detail.propertiesInGroup',
                                        {
                                            count: group.value.props.length,
                                        },
                                        group.value.props.length,
                                    )}
                                </div>
                            </div>
                            <div class={`mt-6 desktop:mt-0 desktop:ml-auto`}>
                                {infoItem(
                                    t('views.detail.id'),
                                    group.value._id,
                                )}
                                {infoItem(
                                    t('views.detail.created'),
                                    millisToDateString(
                                        group.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.updated'),
                                    millisToDateString(
                                        group.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.name'),
                                    group.value.name,
                                )}
                            </div>
                        </div>
                        <PropList
                            class={`mt-3`}
                            items={group.value.props}
                            onRemove={async (prop) => {
                                await throwable(
                                    async () => {
                                        await sdk.group.update({
                                            _id: group.value?._id as string,
                                            propChanges: [
                                                {
                                                    remove: prop.id,
                                                },
                                            ],
                                        });
                                    },
                                    async () => {
                                        notification.success(
                                            t('views.detail.propertyDeleted'),
                                        );
                                    },
                                );
                            }}
                            onMove={async (prop, direction) => {
                                await throwable(
                                    async () => {
                                        await sdk.group.update({
                                            _id: group.value?._id as string,
                                            propChanges: [
                                                {
                                                    update: {
                                                        id: prop.id,
                                                        label: prop.label,
                                                        required: prop.required,
                                                        move: direction,
                                                    },
                                                },
                                            ],
                                        });
                                    },
                                    async () => {
                                        notification.success(
                                            t('views.detail.propertyMoved'),
                                        );
                                    },
                                );
                            }}
                            onEdit={async (prop) => {
                                modal.handlers.propUpdate.open({
                                    data: {
                                        prop,
                                        existingProps: group.value?.props || [],
                                    },
                                    async onDone(output) {
                                        await throwable(
                                            async () => {
                                                await sdk.group.update({
                                                    _id: group.value
                                                        ?._id as string,
                                                    propChanges: [
                                                        {
                                                            update: output.prop,
                                                        },
                                                    ],
                                                });
                                            },
                                            async () => {
                                                notification.success(
                                                    t(
                                                        'views.detail.propertyUpdated',
                                                    ),
                                                );
                                            },
                                        );
                                    },
                                });
                            }}
                        />
                    </div>
                )}
            </>
        );
    },
});

export default GroupView;
