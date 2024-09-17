import { defineComponent, onMounted } from 'vue';
import * as uuid from 'uuid';
import { useRouter } from 'vue-router';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';

export const Link = defineComponent({
    props: {
        ...DefaultComponentProps,
        selected: Boolean,
        href: {
            type: String,
            required: true,
        },
        newTab: Boolean,
        title: String,
        disabled: Boolean,
        tooltip: String,
        clickOverride: Boolean,
    },
    emits: {
        click: (_event: Event) => {
            return true;
        },
        mouseDown: (_event: MouseEvent) => {
            return true;
        },
    },
    setup(props, ctx) {
        const router = useRouter();
        const id = props.id ? props.id : uuid.v4();

        onMounted(() => {
            if (props.selected) {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView(true);
                }
            }
        });

        return () => (
            <a
                v-cy={props.cyTag}
                id={id}
                style={props.style}
                class={props.class}
                href={props.href}
                title={props.title}
                target={props.newTab ? '_blank' : undefined}
                onClick={async (event) => {
                    ctx.emit('click', event);
                    if (!props.clickOverride) {
                        if (props.disabled) {
                            event.preventDefault();
                            return;
                        }
                        if (!props.newTab && !props.href.startsWith('http')) {
                            event.preventDefault();
                            if (event.metaKey || event.ctrlKey) {
                                const routeData = router.resolve({
                                    path: props.href,
                                });
                                window.open(routeData.href, '_blank');
                            } else {
                                await router.push(props.href);
                            }
                        }
                    }
                }}
                onMousedown={(event) => {
                    ctx.emit('mouseDown', event);
                }}
                v-tooltip={props.tooltip}
            >
                {ctx.slots.default ? ctx.slots.default() : ''}
            </a>
        );
    },
});
