import { defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import { Link } from '@bcms/selfhosted-ui/components/link';
import { millisToDateString } from '@bcms/selfhosted-ui/util/date';
import { Icon } from '@bcms/selfhosted-ui/components/icon';
import type { JSX } from 'vue/jsx-runtime';

export const EntityList = defineComponent({
    props: {
        ...DefaultComponentProps,
        items: {
            type: Array as PropType<
                {
                    name: string;
                    slot?: () => JSX.Element;
                    desc?: string;
                    updatedAt: number;
                    href: string;
                }[]
            >,
            required: true,
        },
    },
    setup(props) {
        return () => (
            <div
                id={props.id}
                style={props.style}
                class={`flex flex-col gap-2 ${props.class || ''}`}
            >
                {props.items
                    .map((item) => item)
                    .sort((a, b) =>
                        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
                    )
                    .map((item) => {
                        return (
                            <Link
                                class={`flex gap-2 items-center py-3 px-5 text-sm rounded-2.5 bg-light dark:bg-darkGray dark:hover:bg-gray border border-gray/50 dark:border-gray dark:hover:border-white/50`}
                                href={item.href}
                                title={`${item.name}${
                                    item.desc ? `\n\n${item.desc}` : ''
                                }`}
                            >
                                <div
                                    class={`text-gray-700 font-medium dark:text-white`}
                                >
                                    {item.slot ? item.slot() : item.name}
                                </div>
                                <div>
                                    <span class={`text-gray-600`}>
                                        last edited on{' '}
                                    </span>
                                    <span class={`text-gray-500`}>
                                        {millisToDateString(
                                            item.updatedAt,
                                            true,
                                        )}
                                    </span>
                                </div>
                                <div class={'ml-auto'}>
                                    <Icon
                                        class={`text-brand-700 stroke-current stroke-brand-700`}
                                        src={'/arrow/down'}
                                    />
                                </div>
                            </Link>
                        );
                    })}
            </div>
        );
    },
});
