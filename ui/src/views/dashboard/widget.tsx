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
import type { Widget } from '@bcms/selfhosted-backend/widget/models/main';
import { useI18n } from 'vue-i18n';

export const WidgetView = defineComponent({
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
        const widget = computed(() =>
            sdk.store.widget.find((e) => e._id === route.params.widgetId),
        );

        meta.set({ titleKey: 'routes.widget' });

        const loading = ref(true);
        const dropdownItems = computed<DropdownItem[]>(() => [
            {
                text: t('views.detail.editWidget'),
                onClick() {
                    modal.handlers.widgetCreateEdit.open({
                        data: {
                            widgetId: widget.value?._id,
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
                            return await sdk.widget.whereIsItUsed({
                                widgetId: widget.value?._id as string,
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
                            t('views.detail.deleteWidget'),
                            t('views.detail.deleteWidgetConfirm'),
                        )
                    ) {
                        await throwable(
                            async () => {
                                await sdk.widget.deleteById({
                                    widgetId: widget.value?._id as string,
                                });
                            },
                            async () => {
                                notification.success(
                                    t('views.detail.widgetDeleted'),
                                );
                                await router.replace('/d/widget');
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
                    existingProps: widget.value?.props || [],
                },
                async onDone(data) {
                    const wdgt = widget.value as Widget;
                    await throwable(
                        async () => {
                            await sdk.widget.update({
                                _id: wdgt._id,
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
                await sdk.widget.getAll();
            });
            loading.value = false;
        });

        return () => (
            <>
                {loading.value || !widget.value ? (
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
                                        text: t('routes.widgets'),
                                        href: '/d/widget',
                                    },
                                    {
                                        text: widget.value.label,
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
                                    {widget.value.label}
                                </div>
                                <div class={`text-darkGray dark:text-gray`}>
                                    {t(
                                        'views.detail.propertiesInWidget',
                                        {
                                            count: widget.value.props.length,
                                        },
                                        widget.value.props.length,
                                    )}
                                </div>
                            </div>
                            <div class={`mt-6 desktop:mt-0 desktop:ml-auto`}>
                                {infoItem(
                                    t('views.detail.id'),
                                    widget.value._id,
                                )}
                                {infoItem(
                                    t('views.detail.created'),
                                    millisToDateString(
                                        widget.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.updated'),
                                    millisToDateString(
                                        widget.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.apiName'),
                                    widget.value.name,
                                )}
                            </div>
                        </div>
                        <PropList
                            class={`mt-3`}
                            items={widget.value.props}
                            onRemove={async (prop) => {
                                await throwable(
                                    async () => {
                                        await sdk.widget.update({
                                            _id: widget.value?._id as string,
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
                                        await sdk.widget.update({
                                            _id: widget.value?._id as string,
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
                                        existingProps:
                                            widget.value?.props || [],
                                    },
                                    async onDone(output) {
                                        await throwable(
                                            async () => {
                                                await sdk.widget.update({
                                                    _id: widget.value
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

export default WidgetView;
