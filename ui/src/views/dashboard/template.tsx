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
import type { Template } from '@bcms/selfhosted-backend/template/models/main';
import { useI18n } from 'vue-i18n';

export const TemplateView = defineComponent({
    setup() {
        const { t } = useI18n();
        const meta = window.bcms.meta;
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;

        const route = useRoute();
        const router = useRouter();
        const template = computed(() =>
            sdk.store.template.find((e) => e._id === route.params.templateId),
        );

        meta.set({ titleKey: 'routes.template' });

        const loading = ref(true);
        const dropdownItems = computed<DropdownItem[]>(() => [
            {
                text: t('views.detail.editTemplate'),
                onClick() {
                    modal.handlers.templateCreateEdit.open({
                        data: {
                            templateId: template.value?._id,
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
                            return await sdk.template.whereIsItUsed({
                                templateId: template.value?._id as string,
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
                        !(await confirm(
                            t('views.detail.deleteTemplate'),
                            t('views.detail.deleteTemplateConfirm'),
                            template.value?.name,
                        ))
                    ) {
                        return;
                    }
                    await throwable(
                        async () => {
                            await sdk.template.deleteById({
                                templateId: template.value?._id || '',
                            });
                        },
                        async () => {
                            notification.success(
                                t('views.detail.templateDeleted'),
                            );
                            await router.replace('/d/template');
                        },
                    );
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
                    existingProps: template.value?.props || [],
                    templateId: template.value?._id,
                },
                async onDone(data) {
                    const tmplt = template.value as Template;
                    await throwable(
                        async () => {
                            await sdk.template.update({
                                _id: tmplt._id,
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
                {loading.value || !template.value ? (
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
                                        text: t('routes.templates'),
                                        href: '/d/template',
                                    },
                                    {
                                        text: template.value.label,
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
                                    {template.value.label}
                                </div>
                                <div class={`text-darkGray dark:text-gray`}>
                                    {t(
                                        'views.detail.propertiesInTemplate',
                                        {
                                            count: template.value.props.length,
                                        },
                                        template.value.props.length,
                                    )}
                                </div>
                            </div>
                            <div class={`mt-6 desktop:mt-0 desktop:ml-auto`}>
                                {infoItem(
                                    t('views.detail.id'),
                                    template.value._id,
                                )}
                                {infoItem(
                                    t('views.detail.created'),
                                    millisToDateString(
                                        template.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.updated'),
                                    millisToDateString(
                                        template.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    t('views.detail.name'),
                                    template.value.name,
                                )}
                            </div>
                        </div>
                        <PropList
                            class={`mt-9`}
                            items={template.value.props.slice(0, 2)}
                            uneditable
                        />
                        <PropList
                            class={`mt-3`}
                            items={template.value.props.slice(2)}
                            onRemove={async (prop) => {
                                await throwable(
                                    async () => {
                                        await sdk.template.update({
                                            _id: template.value?._id as string,
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
                                        await sdk.template.update({
                                            _id: template.value?._id as string,
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
                                        templateId: template.value?._id,
                                        existingProps:
                                            template.value?.props || [],
                                    },
                                    async onDone(output) {
                                        await throwable(
                                            async () => {
                                                await sdk.template.update({
                                                    _id: template.value
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

export default TemplateView;
