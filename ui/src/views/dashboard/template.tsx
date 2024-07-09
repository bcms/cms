import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';
import { Breadcrumb } from '@thebcms/selfhosted-ui/components/breadcrumb';
import {
    Dropdown,
    type DropdownItem,
} from '@thebcms/selfhosted-ui/components/dropdown';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { millisToDateString } from '@thebcms/selfhosted-ui/util/date';
import { PropList } from '@thebcms/selfhosted-ui/components/prop-list';
import type { Template } from '@thebcms/selfhosted-backend/template/models/main';

export const TemplateView = defineComponent({
    setup() {
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

        meta.set({ title: 'Template' });

        const loading = ref(true);
        const dropdownItems: DropdownItem[] = [
            {
                text: 'Edit template',
                onClick() {
                    modal.handlers.templateCreateEdit.open({
                        data: {
                            templateId: template.value?._id,
                        },
                    });
                },
            },
            {
                text: 'Where is it used',
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
                text: 'Delete',
                danger: true,
                async onClick() {
                    if (
                        !(await confirm(
                            'Delete template',
                            'Are you sure you' +
                                ' want to delete this template? All entries with' +
                                ' this template will also be deleted.',
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
                                'Template deleted successfully',
                            );
                            await router.replace('/d/template');
                        },
                    );
                },
            },
        ];

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
                            notification.success('Property added successfully');
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
                        <div class={`flex gap-4`}>
                            <Breadcrumb
                                items={[
                                    {
                                        text: 'Home',
                                        icon: '/home',
                                        href: '/d',
                                    },
                                    {
                                        text: 'Templates',
                                        href: '/d/template',
                                    },
                                    {
                                        text: template.value.label,
                                    },
                                ]}
                            />
                            <div class={`flex gap-2 desktop:ml-auto`}>
                                <Dropdown items={dropdownItems} />
                                <Button onClick={createProperty}>
                                    Add property
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
                                    {template.value.props.length} properties in
                                    this template
                                </div>
                            </div>
                            <div class={`mt-6 desktop:mt-0 desktop:ml-auto`}>
                                {infoItem('ID', template.value._id)}
                                {infoItem(
                                    'Created',
                                    millisToDateString(
                                        template.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    'Updated',
                                    millisToDateString(
                                        template.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                {infoItem('Name', template.value.name)}
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
                                            'Property deleted successfully',
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
                                            'Property moved successfully',
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
                                                    'Property updated successfully',
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
