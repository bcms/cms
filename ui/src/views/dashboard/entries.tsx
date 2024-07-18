import { computed, defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';
import { LanguageSwitch } from '@thebcms/selfhosted-ui/components/language-switch';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { EmptyState } from '@thebcms/selfhosted-ui/components/empty-state';
import type { TableHeaderItem } from '@thebcms/selfhosted-ui/components/table/header';
import {
    Table,
    tableDefaultNumberSort,
    tableDefaultSort,
} from '@thebcms/selfhosted-ui/components/table/table';
import type { TableRowProps } from '@thebcms/selfhosted-ui/components/table/row';
import { MediaPreview } from '@thebcms/selfhosted-ui/components/media-preview';
import { millisToDateString } from '@thebcms/selfhosted-ui/util/date';
import {
    Dropdown,
    type DropdownItem,
} from '@thebcms/selfhosted-ui/components/dropdown';
import type {
    EntryLite,
    EntryLiteInfo,
} from '@thebcms/selfhosted-backend/entry/models/main';

export const EntriesView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const confirm = window.bcms.confirm;
        const notification = window.bcms.notification;
        const [lngCode] = window.bcms.useLanguage();

        const router = useRouter();
        const route = useRoute();
        const params = computed(
            () =>
                route.params as {
                    templateId: string;
                },
        );
        let templateIdBuffer = '';

        const template = computed(() =>
            sdk.store.template.findById(params.value.templateId),
        );
        const entriesLite = computed(() =>
            sdk.store.entryLite
                .findMany((e) => e.templateId === template.value?._id)
                .sort((a, b) => b.createdAt - a.createdAt),
        );
        const media = computed(() => sdk.store.media.items());

        const loading = ref(true);
        const tableContainer = ref<HTMLDivElement>();
        const tableData = computed(() => {
            const dynamicRowWidth = tableContainer.value
                ? tableContainer.value.offsetWidth - 96 - 150 - 150 - 250 - 150
                : 300;
            const output: {
                header: TableHeaderItem[];
                rows: TableRowProps[];
            } = {
                header: [
                    {
                        text: 'No.',
                        width: 60,
                    },
                    {
                        text: 'Image',
                        width: 96,
                    },
                    {
                        text: 'Created at',
                        sortable: tableDefaultNumberSort(),
                        width: 150,
                    },
                    {
                        text: 'Updated at',
                        sortable: tableDefaultNumberSort(),
                        width: 150,
                    },
                    {
                        text: 'Title',
                        sortable: tableDefaultSort(),
                        width: 250,
                    },
                    {
                        text: 'Description',
                        sortable: tableDefaultSort(),
                        width: dynamicRowWidth < 300 ? 300 : dynamicRowWidth,
                    },
                    {
                        text: 'Actions',
                        width: 150,
                    },
                ],
                rows: tableRows(),
            };
            return output;
        });

        function tableRowActions(entryLite: EntryLite, info?: EntryLiteInfo) {
            const output: DropdownItem[] = [
                {
                    text: 'Duplicate',
                    icon: '/copy',
                    onClick(event) {
                        console.log(event);
                    },
                },
                {
                    text: 'View model',
                    icon: '/code',
                    onClick(event) {
                        console.log(event);
                    },
                },
                {
                    text: 'Where is it used',
                    icon: '/link',
                    border: true,
                    onClick(event) {
                        console.log(event);
                    },
                },
                {
                    text: 'Delete',
                    icon: '/trash',
                    danger: true,
                    async onClick() {
                        if (
                            await confirm(
                                'Delete entry',
                                <>
                                    <span>
                                        Are you sure you want to delete entry{' '}
                                        <strong>{info?.title || '-'}</strong>?
                                    </span>
                                </>,
                            )
                        ) {
                            await throwable(
                                async () => {
                                    await sdk.entry.deleteById({
                                        entryId: entryLite._id,
                                        templateId: entryLite.templateId,
                                    });
                                },
                                async () => {
                                    notification.success(
                                        'Entry successfully deleted',
                                    );
                                },
                            );
                        }
                    },
                },
            ];
            return output;
        }

        async function init() {
            const loadingTimeout = setTimeout(() => {
                loading.value = true;
            }, 100);
            await throwable(async () => {
                await sdk.template.getAll();
                await sdk.entry.getAllLiteByTemplateId({
                    templateId: params.value.templateId,
                });
            });
            clearTimeout(loadingTimeout);
            loading.value = false;
        }

        onMounted(async () => {
            templateIdBuffer = params.value.templateId;
            await init();
        });

        onBeforeUpdate(async () => {
            if (templateIdBuffer !== params.value.templateId) {
                templateIdBuffer = params.value.templateId;
                await init();
            }
        });

        function tableRows() {
            const rows: TableRowProps[] = [];
            for (let i = 0; i < entriesLite.value.length; i++) {
                const entry = entriesLite.value[i];
                const info = entry.info.find((e) => e.lng === lngCode.value);
                const mediaItem = info?.media
                    ? media.value.find((e) => e._id === info.media)
                    : undefined;
                rows.push({
                    href: route.path + `/${entry._id}`,
                    async onClick() {
                        await router.push(route.path + `/${entry._id}`);
                    },
                    id: entry._id,
                    cells: [
                        {
                            text: (i + 1) + '.',
                        },
                        {
                            text: mediaItem?.name + '',
                            slot() {
                                if (mediaItem) {
                                    return (
                                        <MediaPreview
                                            // class={'w-15 h-15'}
                                            media={mediaItem}
                                            thumbnail
                                        />
                                    );
                                }
                                return <>-</>;
                            },
                        },
                        {
                            text: entry.createdAt + '',
                            slot() {
                                return (
                                    <div>
                                        {millisToDateString(
                                            entry.createdAt,
                                            true,
                                        )}
                                    </div>
                                );
                            },
                        },
                        {
                            text: entry.updatedAt + '',
                            slot() {
                                return (
                                    <div>
                                        {millisToDateString(
                                            entry.updatedAt,
                                            true,
                                        )}
                                    </div>
                                );
                            },
                        },
                        {
                            text: info?.title || '-',
                        },
                        {
                            text: info?.description || '-',
                        },
                        {
                            text: 'action',
                            slot() {
                                return (
                                    <Dropdown
                                        items={tableRowActions(entry, info)}
                                    />
                                );
                            },
                        },
                    ],
                });
            }
            return rows;
        }

        return () => (
            <div class={`min-w-full min-h-full h-full flex flex-col`}>
                {loading.value || !template.value ? (
                    <div class={`m-auto`}>
                        <Loader show />
                    </div>
                ) : (
                    <div class={`min-w-full h-full`}>
                        <div class={`flex gap-2 items-center`}>
                            <h1 class={`font-medium text-xl`}>
                                {template.value.label}
                            </h1>
                            <div class={`ml-auto flex gap-4 items-center`}>
                                <div class={`max-desktop:hidden`}>
                                    <LanguageSwitch />
                                </div>
                                <Button
                                    onClick={async () => {
                                        await throwable(
                                            async () => {
                                                return await sdk.entry.create({
                                                    templateId:
                                                        template.value?._id ||
                                                        '',
                                                    data: {
                                                        statuses: [],
                                                        meta: [],
                                                        content: [],
                                                    },
                                                });
                                            },
                                            async (entry) => {
                                                await router.push(
                                                    route.path +
                                                        '/' +
                                                        entry._id,
                                                );
                                            },
                                        );
                                    }}
                                >
                                    Create new entry
                                </Button>
                            </div>
                        </div>
                        <div
                            class={`relative max-h-full h-full`}
                            ref={tableContainer}
                        >
                            {entriesLite.value.length === 0 ? (
                                <EmptyState
                                    src="/templates.png"
                                    maxWidth="335px"
                                    maxHeight="320px"
                                    class="mt-20 md:absolute md:bottom-32 md:right-32"
                                    title={''}
                                    subtitle={'There are no entries.'}
                                    ctaText={'Create new entry'}
                                />
                            ) : (
                                <div class={`mt-10`}>
                                    <Table
                                        class={`absolute`}
                                        name={`entries_${template.value._id}`}
                                        rowHeight={80}
                                        height={
                                            tableContainer.value
                                                ? tableContainer.value
                                                      .offsetHeight - 100
                                                : 500
                                        }
                                        searchable
                                        header={tableData.value.header}
                                        rows={tableData.value.rows}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    },
});
export default EntriesView;
