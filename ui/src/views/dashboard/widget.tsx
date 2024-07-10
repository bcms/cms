import { computed, defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';
import { Breadcrumb } from '@thebcms/selfhosted-ui/components/breadcrumb';
import {
    Dropdown,
    type DropdownItem,
} from '@thebcms/selfhosted-ui/components/dropdown';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { millisToDateString } from '@thebcms/selfhosted-ui/util/date';
import { PropList } from '@thebcms/selfhosted-ui/components/prop-list';
import type { Widget } from '@thebcms/selfhosted-backend/widget/models/main';

export const WidgetView = defineComponent({
    setup() {
        const meta = window.bcms.meta;
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const modal = window.bcms.modalService;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;

        const route = useRoute();
        const widget = computed(() =>
            sdk.store.widget.find((e) => e._id === route.params.widgetId),
        );

        meta.set({ title: 'Widget' });

        const loading = ref(true);
        const dropdownItems: DropdownItem[] = [
            {
                text: 'Edit widget',
                onClick() {
                    modal.handlers.widgetCreateEdit.open({
                        data: {
                            widgetId: widget.value?._id,
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
                text: 'Delete',
                danger: true,
                async onClick() {
                    if (
                        !(await confirm(
                            'Delete widget',
                            'Are you sure you' + ' want to delete this widget?',
                        ))
                    ) {
                        return;
                    }
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
                                        text: 'Home',
                                        icon: '/home',
                                        href: '/d',
                                    },
                                    {
                                        text: 'Widgets',
                                        href: '/d/widget',
                                    },
                                    {
                                        text: widget.value.label,
                                    },
                                ]}
                            />
                            <div class={`flex gap-2 ml-auto`}>
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
                                    {widget.value.label}
                                </div>
                                <div class={`text-darkGray dark:text-gray`}>
                                    {widget.value.props.length} properties in
                                    this widget
                                </div>
                            </div>
                            <div class={`mt-6 desktop:mt-0 desktop:ml-auto`}>
                                {infoItem('ID', widget.value._id)}
                                {infoItem(
                                    'Created',
                                    millisToDateString(
                                        widget.value.createdAt,
                                        true,
                                    ),
                                )}
                                {infoItem(
                                    'Updated',
                                    millisToDateString(
                                        widget.value?.updatedAt,
                                        true,
                                    ),
                                )}
                                {infoItem('Name', widget.value.name)}
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
                                            'Property deleted successfully',
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
                                            'Property moved successfully',
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

export default WidgetView;
