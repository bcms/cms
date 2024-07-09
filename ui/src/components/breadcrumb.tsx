import { defineComponent, type PropType } from 'vue';
import type { JSX } from 'vue/jsx-runtime';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { Link } from '@thebcms/selfhosted-ui/components/link';

export interface BreadcrumbItem {
    text: string;
    slot?: () => JSX.Element;
    icon?: string;
    href?: string;
    onClick?: (event: Event) => void;
}

export const Breadcrumb = defineComponent({
    props: {
        ...DefaultComponentProps,
        items: {
            type: Array as PropType<BreadcrumbItem[]>,
            required: true,
        },
    },
    setup(props) {
        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`flex gap-2 items-center ${props.class || ''}`}
            >
                {props.items.map((item, itemIdx) => {
                    let output = (
                        <div
                            class={`${
                                itemIdx === 0
                                    ? 'text-gray/50 dark:text-darkGray/50'
                                    : itemIdx === props.items.length - 1
                                    ? 'text-green dark:text-yellow'
                                    : `text-dark dark:text-white`
                            }`}
                        >
                            {item.slot ? (
                                item.slot()
                            ) : item.icon ? (
                                <Icon
                                    class={`fill-current ${
                                        itemIdx === 0
                                            ? 'text-gray/50 dark:text-darkGray/50'
                                            : itemIdx === props.items.length - 1
                                            ? 'text-green dark:text-yellow'
                                            : 'text-dark dark:text-white'
                                    }`}
                                    src={item.icon}
                                />
                            ) : (
                                item.text
                            )}
                        </div>
                    );
                    if (item.href || item.onClick) {
                        output = (
                            <Link
                                class={`${
                                    itemIdx === 0
                                        ? 'text-dark dark:text-white'
                                        : itemIdx === props.items.length - 1
                                        ? 'text-green dark:text-yellow'
                                        : `text-dark dark:text-white`
                                }`}
                                href={item.href || '#'}
                                onClick={item.onClick}
                            >
                                {item.slot ? (
                                    item.slot()
                                ) : item.icon ? (
                                    <Icon
                                        class={`w-5 h-5 ${
                                            itemIdx === 0
                                                ? 'text-dark dark:text-white'
                                                : itemIdx ===
                                                  props.items.length - 1
                                                ? 'text-green dark:text-yellow'
                                                : `text-dark dark:text-white`
                                        }`}
                                        src={item.icon}
                                    />
                                ) : (
                                    item.text
                                )}
                            </Link>
                        );
                    }
                    return (
                        <>
                            {output}
                            {itemIdx < props.items.length - 1 ? (
                                <Icon
                                    class={`fill-current text-dark dark:text-white w-3 h-3`}
                                    src={'/chevron/right'}
                                />
                            ) : (
                                ''
                            )}
                        </>
                    );
                })}
            </div>
        );
    },
});
