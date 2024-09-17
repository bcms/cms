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

export interface ModalWhereIsItUsedResultsInput {
    entryIds?: string[];
    groupIds?: string[];
    templateIds?: string[];
    widgetIds?: string[];
}

export const ModalWhereIsItUsedResults = defineComponent({
    props: getModalDefaultProps<ModalWhereIsItUsedResultsInput, void>(),
    setup(props) {
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
                                text: 'Template',
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
                                text: 'Group',
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
                                text: 'Widget',
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
            <ModalWrapper title={'Where is it used'} handler={props.handler}>
                {tableRows.value.length > 0 ? (
                    <Table
                        class={`w-full`}
                        name="where-is-it-used"
                        rowHeight={40}
                        searchable
                        header={[
                            {
                                text: 'Type',
                                width: 100,
                                filter: tableDefaultFilter([
                                    {
                                        label: 'Template',
                                        value: 'Template',
                                    },
                                    {
                                        label: 'Group',
                                        value: 'Group',
                                    },
                                    {
                                        label: 'Widget',
                                        value: 'Widget',
                                    },
                                    {
                                        label: 'Entry',
                                        value: 'Entry',
                                    },
                                ]),
                            },
                            {
                                text: 'Label',
                                width: 300,
                            },
                        ]}
                        rows={tableRows.value}
                    />
                ) : (
                    <div>No results</div>
                )}
            </ModalWrapper>
        );
    },
});
