import { defineComponent, type PropType } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import {
    DefaultComponentProps,
    type DefaultComponentPropsType,
} from '@thebcms/selfhosted-ui/components/default';

export interface TableCellProps extends DefaultComponentPropsType {
    innerClass?: string;
    text: string;
    slot?: () => JSX.Element;
    onClick?(event: Event): void;
}

export const TableCell = defineComponent({
    props: {
        ...DefaultComponentProps,
        style: String,
        width: {
            type: [String, Number] as PropType<number | 'auto'>,
            required: true,
        },
        minWidth: Number,
        height: {
            type: Number as PropType<number>,
            required: true,
        },
        tag: {
            type: String as PropType<'button' | 'div'>,
            required: true,
        },
    },
    emits: {
        click: (_event: Event) => {
            return true;
        },
    },
    setup(props, ctx) {
        return () => (
            <props.tag
                id={props.style}
                style={`${
                    props.width === 'auto' && props.minWidth
                        ? `flex-grow: 1; min-width: ${props.minWidth}px;`
                        : `width: ${props.width}px;`
                } height: ${props.height}px; ${props.style || ''}`}
                class={`flex flex-shrink-0 px-4 text-sm leading-none font-medium truncate items-center ${
                    props.class || ''
                }`}
                onClick={(event) => {
                    ctx.emit('click', event);
                }}
            >
                {ctx.slots.default ? ctx.slots.default() : ''}
            </props.tag>
        );
    },
});
