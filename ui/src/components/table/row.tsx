import { defineComponent, type PropType } from 'vue';
import {
    DefaultComponentProps,
    type DefaultComponentPropsType,
} from '@bcms/selfhosted-ui/components/default';
import {
    TableCell,
    type TableCellProps,
} from '@bcms/selfhosted-ui/components/table/cell';
import type { TableHeaderItem } from '@bcms/selfhosted-ui/components/table/header';

type RowClick = (event: Event) => Promise<void> | void;

export interface TableRowProps extends DefaultComponentPropsType {
    searchData?: string;
    cells: TableCellProps[];
    notVisible?: boolean;
    onClick?: RowClick;
    href?: string;
}

export const TableRow = defineComponent({
    props: {
        ...DefaultComponentProps,
        header: {
            type: Array as PropType<TableHeaderItem[]>,
            required: true,
        },
        rowHeight: {
            type: Number as PropType<number>,
            required: true,
        },
        cells: {
            type: Array as PropType<TableCellProps[]>,
            required: true,
        },
        onClick: Function as PropType<RowClick | undefined>,
        href: String,
        tag: {
            type: [String, Object] as PropType<'button' | 'div' | any>,
            default: 'div',
        },
        theme: {
            type: String as PropType<'default' | 'lighter'>,
            required: false,
            default: 'default',
        },
    },
    emits: {
        click: (_event: Event) => true,
    },
    setup(props, ctx) {
        return () => (
            <props.tag
                id={props.id}
                href={props.href}
                style={props.style}
                class={`relative ${
                    props.tag === 'button' || props.tag.__name === 'Link'
                        ? props.theme === 'lighter'
                            ? 'w-max min-w-full hover:bg-lightgray dark:hover:bg-lightgray-500'
                            : 'w-max min-w-full hover:bg-lightgray-100 dark:hover:bg-slate'
                        : ''
                } ${
                    props.theme === 'lighter'
                        ? 'after:bg-silver dark:after:bg-lightgray-500'
                        : 'after:bg-lightgray-100 dark:after:bg-slate'
                } after:absolute after:bottom-0 after:left-0 after:w-full after:h-px ${
                    props.class || ''
                } transition-colors duration-300`}
                onClick={(event: Event) => {
                    ctx.emit('click', event);
                }}
            >
                {props.cells.map((cell, colIdx) => {
                    return (
                        <TableCell
                            height={props.rowHeight}
                            tag={cell.onClick ? 'button' : 'div'}
                            width={props.header[colIdx].width}
                            class={cell.class}
                            id={cell.id}
                            style={cell.style}
                            onClick={cell.onClick}
                        >
                            {cell.slot ? (
                                cell.slot()
                            ) : (
                                <div
                                    class={`truncate ${cell.innerClass || ''}`}
                                >
                                    {cell.text}
                                </div>
                            )}
                        </TableCell>
                    );
                })}
            </props.tag>
        );
    },
});
