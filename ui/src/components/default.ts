import type { JSX } from 'vue/jsx-runtime';
import type { PropType } from 'vue';

export type PropStringOrJsxType = string | (() => JSX.Element);

export const PropStringOrJsx = [
    Function,
    String,
] as PropType<PropStringOrJsxType>;

export interface DefaultComponentPropsType {
    id?: string;
    class?: string;
    style?: string;
    cyTag?: string;
}

export const DefaultComponentProps = {
    id: String,
    class: {
        type: String,
        default: '',
    },
    style: String,
    cyTag: String,
};
