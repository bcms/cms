import { computed, defineComponent, onMounted, ref } from 'vue';
import {
    getModalDefaultProps,
    ModalWrapper,
} from '@bcms/selfhosted-ui/components/modals/_wrapper';
import type { TableRowProps } from '@bcms/selfhosted-ui/components/table/row';
import { useRouter } from 'vue-router';
import {
    Table,
    tableDefaultFilter,
} from '@bcms/selfhosted-ui/components/table/table';
import { useI18n } from 'vue-i18n';

export interface ModalWhereIsItUsedResultsInput {
    entryIds?: string[];
    groupIds?: string[];
    templateIds?: string[];
    widgetIds?: string[];
}

export const ModalWhereIsItUsedResults = defineComponent({
    props: getModalDefaultProps<ModalWhereIsItUsedResultsInput, void>(),
    setup(props) {
        const { t } = useI18n();
        const sdk = window.bcms.sdk;
        const router = useRouter();

        const data = ref<ModalWhereIsItUsedResultsInput>({});
        const tableRows = computed(() => {
            const rows: TableRowProps[] = [];
            if (data.value.templateIds) {
                const templates = sdk.store.template.findManyById(
                    data.value.templateIds,
                );
                for (let i = 0; i < templates.length; i++) {
                    const template = templates[i];
                    rows.push({
                        href: `/d/template/${template._id}`,
                        async onClick(event) {
                            event.preventDefault();
                            await router.push(`/d/template/${template._id}`);
                            props.handler.close();
                        },
                        cells: [
                            {
                                text: t('modals.whereUsed.template'),
                            },
                            {
                                text: template.label,
                            },
                        ],
                    });
                }
            }
            if (data.value.groupIds) {
                const groups = sdk.store.group.findManyById(
                    data.value.groupIds,
                );
                for (let i = 0; i < groups.length; i++) {
                    const group = groups[i];
                    rows.push({
                        href: `/d/group/${group._id}`,
                        async onClick(event) {
                            event.preventDefault();
                            await router.push(`/d/group/${group._id}`);
                            props.handler.close();
                        },
                        cells: [
                            {
                                text: t('modals.whereUsed.group'),
                            },
                            {
                                text: group.label,
                            },
                        ],
                    });
                }
            }
            if (data.value.widgetIds) {
                const widgets = sdk.store.widget.findManyById(
                    data.value.widgetIds,
                );
                for (let i = 0; i < widgets.length; i++) {
                    const widget = widgets[i];
                    rows.push({
                        href: `/d/widget/${widget._id}`,
                        async onClick(event) {
                            event.preventDefault();
                            await router.push(`/d/widget/${widget._id}`);
                            props.handler.close();
                        },
                        cells: [
                            {
                                text: t('modals.whereUsed.widget'),
                            },
                            {
                                text: widget.label,
                            },
                        ],
                    });
                }
            }
            return rows;
        });

        onMounted(() => {
            const handler = props.handler;
            handler._onOpen = (event) => {
                if (event?.data) {
                    data.value = event.data;
                }
            };
            handler._onDone = async () => {
                return [true, undefined];
            };
            handler._onCancel = async () => {
                return true;
            };
        });

        return () => (
            <ModalWrapper
                title={t('modals.whereUsed.title')}
                handler={props.handler}
            >
                {tableRows.value.length > 0 ? (
                    <Table
                        class={`w-full`}
                        name="where-is-it-used"
                        rowHeight={40}
                        searchable
                        header={[
                            {
                                text: t('modals.whereUsed.type'),
                                width: 100,
                                filter: tableDefaultFilter([
                                    {
                                        label: t('modals.whereUsed.template'),
                                        value: 'Template',
                                    },
                                    {
                                        label: t('modals.whereUsed.group'),
                                        value: 'Group',
                                    },
                                    {
                                        label: t('modals.whereUsed.widget'),
                                        value: 'Widget',
                                    },
                                    {
                                        label: t('routes.entry'),
                                        value: 'Entry',
                                    },
                                ]),
                            },
                            {
                                text: t('modals.whereUsed.label'),
                                width: 300,
                            },
                        ]}
                        rows={tableRows.value}
                    />
                ) : (
                    <div>{t('modals.whereUsed.noResults')}</div>
                )}
            </ModalWrapper>
        );
    },
});
