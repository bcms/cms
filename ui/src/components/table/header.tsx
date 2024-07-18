import {
    defineComponent,
    onMounted,
    type PropType,
    ref,
    Transition,
    Teleport,
} from 'vue';
import { Icon } from '../icon';
import {
    DefaultComponentProps,
    type DefaultComponentPropsType,
} from '@thebcms/selfhosted-ui/components/default';
import {
    TableCell,
    type TableCellProps,
} from '@thebcms/selfhosted-ui/components/table/cell';
import { Storage } from '@thebcms/selfhosted-ui/storage';
import { Select } from '@thebcms/selfhosted-ui/components/inputs/select/main';

export interface TableHeaderItemSort {
    type: string;
    colIdx: number;
}

export interface TableHeaderItemFilter {
    option: TableHeaderFilterOption;
    colIdx: number;
    rowIdx: number;
    value: string;
}

export interface TableHeaderSortableOption {
    label: string;
    value: string;
}

export interface TableHeaderFilterOption {
    label: string;
    value: string;
}

export interface TableHeaderSortable {
    options: TableHeaderSortableOption[];
    onSort(event: TableHeaderItemSort, a: string, b: string): number;
}

export interface TableHeaderFilter {
    options: TableHeaderFilterOption[];
    onFilter(event: TableHeaderItemFilter): boolean;
}

export interface TableHeaderItem
    extends DefaultComponentPropsType,
        TableCellProps {
    cy?: string;
    width: number | 'auto';
    minWidth?: number;
    sortable?: TableHeaderSortable;
    filter?: TableHeaderFilter;
}

export interface TableHeaderDropdownInfo {
    show: boolean;
    activeOption: number;
    top: number;
    left: number;
    pointer: string;
}

export const TableHeader = defineComponent({
    props: {
        ...DefaultComponentProps,
        tableName: {
            type: String,
            required: true,
        },
        rowHeight: {
            type: Number as PropType<number>,
            required: true,
        },
        items: {
            type: Array as PropType<TableHeaderItem[]>,
            required: true,
        },
    },
    emits: {
        sort: (_event: TableHeaderItemSort) => {
            return true;
        },
        filter: (_event: TableHeaderItemFilter) => {
            return true;
        },
        dropdownInfo: (_info: TableHeaderDropdownInfo[]) => {
            return true;
        },
    },
    setup(props, ctx) {
        const headerDropdown = ref<TableHeaderDropdownInfo[]>(
            props.items.map(() => {
                return {
                    show: false,
                    activeOption: -1,
                    top: 0,
                    left: 0,
                    pointer: '',
                };
            }),
        );

        function initHeader() {
            const sortData = Storage.get<TableHeaderItemSort | 'null'>(
                `${props.tableName}-sort`,
            );
            const storageActiveFilters = Storage.get<
                TableHeaderItemFilter[] | 'null'
            >(`${props.tableName}-filter`);
            if (sortData && sortData !== 'null') {
                const optionIdx = props.items[
                    sortData.colIdx
                ].sortable?.options.findIndex((e) => e.value === sortData.type);
                if (typeof optionIdx === 'number') {
                    headerDropdown.value[sortData.colIdx].activeOption =
                        optionIdx;
                }
            }
            if (storageActiveFilters && storageActiveFilters !== 'null') {
                for (let i = 0; i < storageActiveFilters.length; i++) {
                    const activeFilter = storageActiveFilters[i];
                    const optionIdx = props.items[
                        activeFilter.colIdx
                    ].filter?.options.findIndex(
                        (e) =>
                            e.value === activeFilter.option.value &&
                            e.label === activeFilter.option.label,
                    );
                    if (typeof optionIdx === 'number' && optionIdx !== -1) {
                        selectFilterOption(
                            activeFilter.option,
                            optionIdx,
                            activeFilter.colIdx,
                        );
                    }
                }
            }
        }

        onMounted(() => {
            initHeader();
            ctx.emit('dropdownInfo', headerDropdown.value);
        });

        function selectFilterOption(
            option: TableHeaderFilterOption,
            optionIdx: number,
            colIdx: number,
            pointer?: string,
        ) {
            if (optionIdx === headerDropdown.value[colIdx].activeOption) {
                ctx.emit('filter', {
                    option: {
                        label: 'Clear filter',
                        value: '__clear__',
                    },
                    colIdx,
                    rowIdx: -1,
                    value: '_ignored',
                });
                headerDropdown.value[colIdx].activeOption = -1;
                headerDropdown.value[colIdx].pointer = '';
            } else {
                ctx.emit('filter', {
                    option,
                    colIdx,
                    rowIdx: -1,
                    value: '_ignored',
                });
                if (option.value !== '__clear__') {
                    headerDropdown.value[colIdx].activeOption = optionIdx;
                    headerDropdown.value[colIdx].pointer = pointer || '';
                } else {
                    for (let i = 0; i < headerDropdown.value.length; i++) {
                        const data = headerDropdown.value[i];
                        data.activeOption = -1;
                        data.pointer = '';
                    }
                }
            }
            headerDropdown.value[colIdx].show = false;
        }

        function sortableHeaderItem(
            headerItem: TableHeaderItem,
            colIdx: number,
        ) {
            if (!headerItem.sortable) {
                return <></>;
            }
            return (
                <>
                    {headerItem.sortable.options.map((option, optionIdx) => {
                        return (
                            <button
                                class={`flex w-full px-3 py-2 transition-colors duration-300 text-left hover:text-brand-600 hover:bg-lightgray-200 dark:hover:bg-lightgray-500 ${
                                    optionIdx ===
                                    headerDropdown.value[colIdx].activeOption
                                        ? 'text-brand-600'
                                        : ''
                                }`}
                                onClick={() => {
                                    if (
                                        optionIdx ===
                                        headerDropdown.value[colIdx]
                                            .activeOption
                                    ) {
                                        ctx.emit('sort', {
                                            type: option.value,
                                            colIdx: colIdx,
                                        });
                                        headerDropdown.value[
                                            colIdx
                                        ].activeOption = -1;
                                    } else {
                                        ctx.emit('sort', {
                                            type: option.value,
                                            colIdx,
                                        });
                                        if (option.value !== '__clear__') {
                                            headerDropdown.value[
                                                colIdx
                                            ].activeOption = optionIdx;
                                        } else {
                                            for (
                                                let i = 0;
                                                i < headerDropdown.value.length;
                                                i++
                                            ) {
                                                const data =
                                                    headerDropdown.value[i];

                                                data.activeOption = -1;
                                            }
                                        }
                                    }
                                    headerDropdown.value[colIdx].show = false;
                                }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </>
            );
        }

        function filterableHeaderItem(
            headerItem: TableHeaderItem,
            colIdx: number,
        ) {
            if (!headerItem.filter) {
                return <></>;
            }
            if (headerItem.filter.options.length < 8) {
                return (
                    <>
                        {headerItem.filter.options.map((option, optionIdx) => {
                            return (
                                <button
                                    class={`flex w-full px-3 py-2 transition-colors duration-300 text-left hover:bg-green dark:hover:bg-yellow dark:hover:text-dark ${
                                        optionIdx ===
                                        headerDropdown.value[colIdx]
                                            .activeOption
                                            ? 'bg-gray'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        selectFilterOption(
                                            option,
                                            optionIdx,
                                            colIdx,
                                        );
                                    }}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </>
                );
            } else {
                return (
                    <Select
                        class="p-2"
                        label="Filter by condition"
                        placeholder="None"
                        selected={headerDropdown.value[colIdx].pointer}
                        options={headerItem.filter.options.map(
                            (option, optionIdx) => {
                                return {
                                    label: option.label,
                                    value: optionIdx + '_' + option.value,
                                };
                            },
                        )}
                        onChange={(option) => {
                            if (option) {
                                const parts = option.value.split('_');
                                selectFilterOption(
                                    {
                                        label: option.label,
                                        value: parts.slice(1).join('_'),
                                    },
                                    parseInt(parts[0]),
                                    colIdx,
                                    option.value,
                                );
                            } else {
                                throw Error('No option');
                            }
                        }}
                    />
                );
            }
        }

        function headerDropdownWrapper(
            headerItem: TableHeaderItem,
            colIdx: number,
        ) {
            return (
                <>
                    {headerDropdown.value[colIdx].show && (
                        <div
                            class={`fixed flex flex-col items-start py-1 max-h-[300px] overflow-y-auto rounded-md bg-white dark:bg-darkGray shadow-input text-sm w-[200px] text-black dark:text-white`}
                            style={`top: ${headerDropdown.value[colIdx].top}px; left: ${headerDropdown.value[colIdx].left}px; z-index: 1000;`}
                            v-clickOutside={() =>
                                (headerDropdown.value[colIdx].show = false)
                            }
                        >
                            {sortableHeaderItem(headerItem, colIdx)}
                            {filterableHeaderItem(headerItem, colIdx)}
                        </div>
                    )}
                </>
            );
        }

        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`flex sticky top-0 z-20 after:absolute after:bottom-0 after:left-0 after:w-full after:h-px
                 ${props.class || ''}`}
            >
                {props.items.map((headerItem, colIdx) => {
                    return (
                        <TableCell
                            data-cy={headerItem.cy}
                            class={`flex items-center text-sm leading-none font-medium gap-2.5
                            bg-light dark:bg-darkGray backdrop-blur-xl first:rounded-l-2.5 last:rounded-r-2.5
                            ${
                                props.class || ''
                            }`}
                            height={props.rowHeight}
                            tag={
                                headerItem.sortable || headerItem.filter
                                    ? 'button'
                                    : 'div'
                            }
                            width={headerItem.width}
                            onClick={
                                headerItem.sortable || headerItem.filter
                                    ? (event) => {
                                          const bb = (
                                              event.currentTarget as HTMLButtonElement
                                          ).children[1].children[0].children[0].getBoundingClientRect();
                                          headerDropdown.value[colIdx].top =
                                              bb.top + props.rowHeight / 2;
                                          if (
                                              bb.left + 200 >
                                              window.innerWidth
                                          ) {
                                              headerDropdown.value[
                                                  colIdx
                                              ].left = bb.left - 200;
                                          } else {
                                              headerDropdown.value[
                                                  colIdx
                                              ].left = bb.left;
                                          }
                                          headerDropdown.value[colIdx].show =
                                              !headerDropdown.value[colIdx]
                                                  .show;
                                      }
                                    : undefined
                            }
                        >
                            <div
                                class={`${
                                    headerDropdown.value[colIdx].activeOption >
                                    -1
                                        ? 'text-brand-600'
                                        : ''
                                }`}
                            >
                                {headerItem.text}
                            </div>
                            {(headerItem.sortable || headerItem.filter) && (
                                <>
                                    <div
                                        class={`flex p-2 pr-0 transition-colors duration-300 dark:hover:text-white`}
                                    >
                                        <Icon
                                            src="/chevron/right"
                                            class="rotate-[90deg] w-2 h-2 text-gray fill-current"
                                        />
                                    </div>
                                    <Teleport to="body">
                                        <Transition name="fade">
                                            <div>
                                                {headerDropdownWrapper(
                                                    headerItem,
                                                    colIdx,
                                                )}
                                            </div>
                                        </Transition>
                                    </Teleport>
                                </>
                            )}
                        </TableCell>
                    );
                })}
            </div>
        );
    },
});
