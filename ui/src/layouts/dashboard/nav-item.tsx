import type { JSX } from 'vue/jsx-runtime';
import { computed, defineComponent, type PropType, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { ViewNames } from '@bcms/selfhosted-ui/views';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import { Link } from '@bcms/selfhosted-ui/components/link';
import { Icon } from '@bcms/selfhosted-ui/components/icon';

export interface DashboardLayoutNavItemProps {
    title: string;
    titleSlot?: () => JSX.Element;
    activeOnViews: ViewNames[];
    href?: string;
    onClick?: (event: Event) => void;
    visible?: boolean;
    children?: DashboardLayoutNavItemProps[];
}

export const DashboardLayoutNavItem = defineComponent({
    props: {
        ...DefaultComponentProps,
        item: {
            type: Object as PropType<DashboardLayoutNavItemProps>,
            required: true,
        },
    },

    setup(props) {
        const route = useRoute();
        const extended = ref(
            props.item.activeOnViews.includes(route.name as any),
        );
        const tag = computed<any>(() => (props.item.href ? Link : 'button'));

        return () => (
            <>
                {props.item.visible && (
                    <div
                        id={props.id}
                        data-tag={(route.name as any) + route.params.templateId}
                        style={props.style}
                        class={`flex flex-col gap-2 items-center w-full ${
                            !props.item.children &&
                            (props.item.activeOnViews.includes(
                                route.name as any,
                            ) ||
                                props.item.activeOnViews.includes(
                                    (route.name as any) +
                                        route.params.templateId,
                                ) ||
                                props.item.activeOnViews.includes(
                                    (route.name as any) + route.params.pluginId,
                                ))
                                ? 'text-green dark:text-yellow'
                                : 'text-black dark:text-white'
                        } ${props.class || ''}`}
                    >
                        <tag.value
                            className={`pl-1 py-3 flex gap-2 items-center w-full group hover:text-green dark:hover:text-yellow transition-all duration-300`}
                            href={props.item.href || '#'}
                            onClick={(event: Event) => {
                                if (tag.value === 'button') {
                                    extended.value = !extended.value;
                                }
                                if (props.item.onClick) {
                                    props.item.onClick(event);
                                }
                            }}
                        >
                            {props.item.children ? (
                                <div
                                    class={`flex ${
                                        extended.value
                                            ? 'rotate-[-90deg]'
                                            : 'rotate-[90deg]'
                                    }`}
                                >
                                    <Icon
                                        class={`w-1 h-2 text-dark fill-current dark:text-light group-hover:text-green dark:group-hover:text-yellow transition-all duration-300`}
                                        src={`/caret/right`}
                                    />
                                </div>
                            ) : (
                                ''
                            )}
                            {props.item.titleSlot
                                ? props.item.titleSlot()
                                : props.item.title}
                        </tag.value>
                        {extended.value && props.item.children && (
                            <div class={'flex flex-col gap-1 mb-3 w-full pl-4'}>
                                {props.item.children.map((item) => {
                                    return (
                                        <DashboardLayoutNavItem item={item} />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </>
        );
    },
});
