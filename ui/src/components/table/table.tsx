import {
    defineComponent,
    type PropType,
    onMounted,
    onBeforeUpdate,
    ref,
    computed,
} from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import {
    TableHeader,
    type TableHeaderDropdownInfo,
    type TableHeaderFilter,
    type TableHeaderFilterOption,
    type TableHeaderItem,
    type TableHeaderItemFilter,
    type TableHeaderItemSort,
    type TableHeaderSortable,
} from '@thebcms/selfhosted-ui/components/table/header';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import {
    TableRow,
    type TableRowProps,
} from '@thebcms/selfhosted-ui/components/table/row';
import { Storage } from '@thebcms/selfhosted-ui/storage';
import { TextInput } from '@thebcms/selfhosted-ui/components/inputs/text';
import { Link } from '@thebcms/selfhosted-ui/components/link';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export function tableDefaultSort(): TableHeaderSortable {
    return {
        options: [
            { label: 'Sort A to Z', value: 'az' },
            { label: 'Sort Z to A', value: 'za' },
        ],
        onSort(event, a, b) {
            switch (event.type) {
                case 'az': {
                    return tableAZSort(a, b);
                }
                case 'za': {
                    return tableZASort(a, b);
                }
            }
            return 0;
        },
    };
}

export function tableDefaultNumberSort(): TableHeaderSortable {
    return {
        options: [
            { label: 'Ascending', value: 'a' },
            { label: 'Descending', value: 'd' },
        ],
        onSort(event, a, b) {
            const reg = /[$]|[%]|[,]/g;
            switch (event.type) {
                case 'a': {
                    return (
                        parseFloat(a.replace(reg, '')) -
                        parseFloat(b.replace(reg, ''))
                    );
                }
                case 'd': {
                    return (
                        parseFloat(b.replace(reg, '')) -
                        parseFloat(a.replace(reg, ''))
                    );
                }
            }
            return 0;
        },
    };
}

export function tableDefaultFilter(
    options: TableHeaderFilterOption[],
): TableHeaderFilter {
    return {
        options: [...options],
        onFilter(event) {
            if (event.option.value === '__clear__') {
                return true;
            }
            return event.value.includes(event.option.value);
        },
    };
}

export function tableAZSort(a: string, b: string): number {
    return a > b ? 1 : -1;
}

export function tableZASort(a: string, b: string): number {
    return a < b ? 1 : -1;
}

export function tableAscSort(a: string, b: string): number {
    return parseFloat(b.replace(/,/g, '')) - parseFloat(a.replace(/,/g, ''));
}

export function tableDescSort(a: string, b: string): number {
    return parseFloat(a.replace(/,/g, '')) - parseFloat(b.replace(/,/g, ''));
}

export const Table = defineComponent({
    props: {
        ...DefaultComponentProps,
        name: {
            type: String,
            required: true,
        },
        searchable: Boolean,
        searchWrapperClass: String,
        title: Function as PropType<() => JSX.Element>,
        height: Number,
        rowHeight: {
            type: Number,
            required: true,
        },
        header: {
            type: Array as PropType<TableHeaderItem[]>,
            required: true,
        },
        rows: {
            type: Array as PropType<TableRowProps[]>,
            required: true,
        },
        emptyTitle: String,
        emptyDescription: String,
        doSearch: Function as PropType<
            (searchHandler: (value?: string) => void) => void
        >,
        doSort: Function as PropType<
            (sortHandler: (item?: TableHeaderItemSort) => void) => void
        >,
        doFilter: Function as PropType<
            (filterHandler: (item?: TableHeaderItemFilter) => void) => void
        >,
    },
    emits: {
        search: (_value?: string) => {
            return true;
        },
        sort: (_item?: TableHeaderItemSort) => {
            return true;
        },
        filter: (_item?: TableHeaderItemFilter) => {
            return true;
        },
    },
    setup(props, ctx) {
        const scrollWrapper = ref<HTMLDivElement | null>(null);
        const isTableExpanded = ref(true);

        const rows = ref<
            Array<
                TableRowProps & {
                    initialOrder: number;
                }
            >
        >([]);
        const headerDropdown = ref<TableHeaderDropdownInfo[]>([]);
        const paddingTop = ref(0);
        const atRow = ref(0);
        const rowsRef = ref<HTMLDivElement | null>(null);
        const activeSearch = ref('');
        let activeFilters: TableHeaderItemFilter[] = [];
        let activeSort: TableHeaderItemSort | null = null;
        const visibleRows = computed(() => {
            if (props.height) {
                const n = `${props.height / props.rowHeight}`;
                return n.includes('.') ? parseInt(n) + 1 : parseInt(n) + 1;
            }
            return 0;
        });
        let rowsBuffer = '';
        let vScrollTop = 0;

        function searchText(searchTerm?: string) {
            if (typeof searchTerm === 'string') {
                activeSearch.value = searchTerm.toLowerCase();
            }
            colFilter();
            scrollWrapper.value?.scrollTo(0, 0);
        }

        function searchHandler(value?: string, doNotEmit?: boolean) {
            value = value || '';
            searchText(value);
            if (rowsRef.value) {
                rowsRef.value.scrollTop = 0;
                vScrollTop = 0;
                virtualScrollCalc();
            }
            Storage.set(`${props.name}-search`, activeSearch.value).catch(
                (err) => {
                    console.error(err);
                },
            );
            if (!doNotEmit) {
                ctx.emit('search', value);
            }
        }

        function colSort(sortItem?: TableHeaderItemSort) {
            if (sortItem) {
                if (
                    activeSort?.type === sortItem.type &&
                    activeSort.colIdx === sortItem.colIdx
                ) {
                    activeSort = null;
                } else {
                    activeSort = sortItem;
                }
            }
            if (activeSort && props.header[activeSort.colIdx]?.sortable) {
                const s = (
                    props.header[activeSort.colIdx]
                        .sortable as TableHeaderSortable
                ).onSort;
                const colIdx = activeSort.colIdx;
                rows.value.sort((a, b) => {
                    const aValue = a.cells[colIdx].text.toLowerCase();
                    const bValue = b.cells[colIdx].text.toLowerCase();
                    return s(activeSort as TableHeaderItemSort, aValue, bValue);
                });
            } else {
                rows.value.sort((a, b) => a.initialOrder - b.initialOrder);
            }
        }

        function sortHandler(
            sortItem?: TableHeaderItemSort,
            doNotEmit?: boolean,
        ) {
            colSort(sortItem);
            virtualScrollCalc();
            Storage.set(`${props.name}-sort`, activeSort).catch((err) => {
                console.error(err);
            });
            if (!doNotEmit) {
                ctx.emit('sort', sortItem);
            }
        }

        function doSearchFilter(text: string): boolean {
            if (text.length > 2 && text.includes(activeSearch.value)) {
                return false;
            }
            return true;
        }

        function colFilter(filterItem?: TableHeaderItemFilter) {
            if (filterItem) {
                let filterFound = false;
                for (let i = 0; i < activeFilters.length; i++) {
                    const activeFilter = activeFilters[i];
                    if (activeFilter.colIdx === filterItem.colIdx) {
                        activeFilters[i] = filterItem;
                        filterFound = true;
                        break;
                    }
                }
                if (!filterFound) {
                    activeFilters.push(filterItem);
                }
            }
            for (let i = 0; i < rows.value.length; i++) {
                const row = rows.value[i];
                row.notVisible = false;
                for (let j = 0; j < activeFilters.length; j++) {
                    const activeFilter = activeFilters[j];
                    const filterFn = props.header[activeFilter.colIdx];
                    if (
                        activeFilter.value !== '' &&
                        !filterFn.filter?.onFilter({
                            option: activeFilter.option,
                            colIdx: activeFilter.colIdx,
                            rowIdx: i,
                            value: row.cells[activeFilter.colIdx].text,
                        })
                    ) {
                        row.notVisible = true;
                        break;
                    }
                }
                if (
                    row.notVisible === false &&
                    doSearchFilter(
                        row.searchData +
                            ' ' +
                            row.cells
                                .map((e) => e.text)
                                .join(' ')
                                .toLowerCase(),
                    )
                ) {
                    row.notVisible = true;
                }
            }
        }

        function filterHandler(
            filterItem?: TableHeaderItemFilter,
            doNotEmit?: boolean,
        ) {
            colFilter(filterItem);
            scrollWrapper.value?.scrollTo(0, 0);
            virtualScrollCalc();
            Storage.set(`${props.name}-filter`, activeFilters).catch((err) => {
                console.error(err);
            });
            if (!doNotEmit) {
                ctx.emit('filter', filterItem);
            }
        }

        function virtualScrollCalc() {
            // clearTimeout(virtualScrollDebounce);
            // virtualScrollDebounce = setTimeout(() => {
            if (props.height) {
                const scrollTop = vScrollTop;
                atRow.value = parseInt(`${scrollTop / props.rowHeight}`);
                paddingTop.value =
                    props.rowHeight +
                    parseInt(`${scrollTop / props.rowHeight}`) *
                        props.rowHeight;
            }
            // }, 20);
        }

        function initTable() {
            const sortData = Storage.get<TableHeaderItemSort | 'null'>(
                `${props.name}-sort`,
            );
            const storageActiveFilters = Storage.get<
                TableHeaderItemFilter[] | 'null'
            >(`${props.name}-filter`);
            const searchData = Storage.get(`${props.name}-search`);

            if (sortData && sortData !== 'null') {
                activeSort = sortData;
            }
            if (storageActiveFilters && storageActiveFilters !== 'null') {
                activeFilters = storageActiveFilters;
            }
            if (searchData) {
                activeSearch.value = searchData;
            }
        }

        onMounted(async () => {
            if (props.doSearch) {
                props.doSearch((value) => {
                    searchHandler(value, true);
                });
            }
            if (props.doSort) {
                props.doSort((item) => {
                    sortHandler(item, true);
                });
            }
            if (props.doFilter) {
                props.doFilter((item) => {
                    filterHandler(item, true);
                });
            }
            rowsBuffer = JSON.stringify(props.rows);
            rows.value = props.rows.map((e, i) => {
                return {
                    ...e,
                    initialOrder: i,
                };
            });
            if (props.height) {
                virtualScrollCalc();
            }
            initTable();
            colFilter();
            colSort();
        });

        onBeforeUpdate(async () => {
            const rt = JSON.stringify(props.rows);
            if (
                rt !== rowsBuffer &&
                props.rows[0] &&
                props.rows[0].cells.length === props.header.length
            ) {
                rowsBuffer = rt;
                rows.value = props.rows.map((e, i) => {
                    return {
                        ...e,
                        initialOrder: i,
                    };
                });
                if (props.height) {
                    virtualScrollCalc();
                }
                initTable();
                colFilter();
                colSort();
            }
        });

        function rowsWrapper() {
            if (props.height) {
                return (
                    <div
                        class="flex flex-col absolute w-full"
                        style={`padding-top: ${paddingTop.value}px;`}
                    >
                        {rows.value
                            .filter((row) => !row.notVisible)
                            .slice(atRow.value, atRow.value + visibleRows.value)
                            .map((row) => {
                                return (
                                    <TableRow
                                        id={row.id}
                                        style={row.style}
                                        class={`${
                                            row.notVisible ? 'hidden' : 'flex'
                                        } ${row.class}`}
                                        cells={row.cells}
                                        header={props.header}
                                        rowHeight={props.rowHeight}
                                        tag={
                                            row.href
                                                ? Link
                                                : row.onClick
                                                ? 'button'
                                                : 'div'
                                        }
                                        href={row.href}
                                        onClick={row.onClick}
                                    />
                                );
                            })}
                    </div>
                );
            } else {
                return (
                    <>
                        {rows.value.map((row) => {
                            return (
                                <TableRow
                                    id={row.id}
                                    style={row.style}
                                    class={`${
                                        row.notVisible ? 'hidden' : 'flex'
                                    } ${row.class}`}
                                    cells={row.cells}
                                    header={props.header}
                                    rowHeight={props.rowHeight}
                                    tag={
                                        row.href
                                            ? Link
                                            : row.onClick
                                            ? 'button'
                                            : 'div'
                                    }
                                    href={row.href}
                                    onClick={row.onClick}
                                />
                            );
                        })}
                    </>
                );
            }
        }

        return () => (
            <div>
                {(props.searchable || props.title) && (
                    <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
                        {props.title && (
                            <div class="flex flex-1">{props.title()}</div>
                        )}
                        {props.searchable && props.rows.length > 0 && (
                            <div class={props.searchWrapperClass || ''}>
                                <TextInput
                                    placeholder="Search"
                                    value={activeSearch.value}
                                    onInput={(value) => {
                                        searchHandler(value);
                                    }}
                                    class="w-[260px]"
                                />
                            </div>
                        )}
                    </div>
                )}
                {props.rows.length > 0 ? (
                    <div
                        class="overflow-hidden"
                        style={{
                            maxHeight: isTableExpanded.value
                                ? props.height
                                    ? `${props.height}px`
                                    : `${
                                          (props.rows.filter(
                                              (e) => !e.notVisible,
                                          ).length +
                                              1) *
                                          props.rowHeight
                                      }px`
                                : `${props.rowHeight}px`,
                        }}
                    >
                        <div
                            id={props.id}
                            class={`flex flex-col ${
                                props.class || ''
                            } max-w-full`}
                            style={`${
                                props.height ? `height: ${props.height}px;` : ''
                            } ${props.style}`}
                        >
                            <div
                                ref={scrollWrapper}
                                class={`w-full overflow-auto flex-1 bcmsScrollbar`}
                                onScroll={(event) => {
                                    event.preventDefault();
                                    // Close all active header dropdowns
                                    headerDropdown.value.forEach((e) => {
                                        e.show = false;
                                    });
                                    if (props.height) {
                                        vScrollTop = event
                                            ? (event.target as HTMLDivElement)
                                                  .scrollTop
                                            : 0;
                                        virtualScrollCalc();
                                    }
                                }}
                            >
                                <div
                                    ref={rowsRef}
                                    class="flex flex-col relative"
                                    style={
                                        props.rows.length > 0 && props.height
                                            ? `min-height: ${
                                                  (props.rows.filter(
                                                      (e) => !e.notVisible,
                                                  ).length +
                                                      1) *
                                                  props.rowHeight
                                              }px;`
                                            : ''
                                    }
                                >
                                    <TableHeader
                                        tableName={props.name}
                                        items={props.header}
                                        rowHeight={props.rowHeight}
                                        onSort={(event) => {
                                            sortHandler(event);
                                        }}
                                        onFilter={(event) => {
                                            filterHandler(event);
                                        }}
                                        onDropdownInfo={(info) => {
                                            headerDropdown.value = info;
                                        }}
                                    />
                                    {rowsWrapper()}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        id={props.id}
                        class="flex flex-col items-center justify-center text-center rounded-md px-8 bg-lightgray-100 py-12 h-[170px] dark:bg-slate"
                    >
                        <Icon src="/sleep" class="w-6 h-6 text-silver mb-3" />
                        <div class="text-sm leading-none tracking-[-0.28px] font-semibold mb-2">
                            {props.emptyTitle || 'No results to show'}
                        </div>
                        {props.emptyDescription && (
                            <p class="text-silver text-xs leading-[1.3] font-medium">
                                {props.emptyDescription}
                            </p>
                        )}
                    </div>
                )}
            </div>
        );
    },
});
