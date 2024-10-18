import { defineComponent, onBeforeUpdate, onMounted, ref } from 'vue';
import {
    createQueue,
    type Queue,
    QueueError,
} from '@bcms/selfhosted-utils/queue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';

const cache: {
    [src: string]: string;
} = {};

function styleInjection(input: string, cls?: string, style?: string): string {
    let output = '' + input;
    if (cls) {
        output = output.replace('<svg', `<svg class="${cls}"`);
    }
    if (style) {
        output = output.replace('<svg', `<svg style="${style}"`);
    }
    return output;
}

export async function iconLoad(
    path: string,
    cls?: string,
    style?: string,
): Promise<string> {
    if (cache[path]) {
        return styleInjection(cache[path], cls, style);
    } else {
        const response = await fetch(`/assets/icons${path}.svg`);
        const value = await response.text();
        const src = styleInjection(value, cls, style);
        cache[path] = src;
        return src;
    }
}

const queue: {
    [id: string]: Queue<void>;
} = {};

export const Icon = defineComponent({
    props: {
        ...DefaultComponentProps,
        src: {
            type: String,
            required: true,
        },
        title: String,
    },
    setup(props) {
        let srcBuffer = '';
        const container = ref<HTMLElement | undefined>();

        async function init() {
            const path = props.src;
            if (path) {
                if (!queue[path]) {
                    queue[path] = createQueue();
                }
                const result = await queue[path]({
                    name: 'init',
                    handler: async () => {
                        if (cache[path]) {
                            const el = container.value;
                            if (el) {
                                el.innerHTML = '';
                                el.innerHTML = styleInjection(
                                    cache[path],
                                    props.class,
                                    props.style,
                                );
                            }
                        } else {
                            const response = await fetch(
                                `/assets/icons${path}.svg`,
                            );
                            const value = await response.text();
                            const src = styleInjection(
                                value,
                                props.class,
                                props.style,
                            );
                            const el = container.value;
                            if (el) {
                                el.innerHTML = '';
                                el.innerHTML = styleInjection(
                                    src,
                                    props.class,
                                    props.style,
                                );
                            }
                            cache[path] = value;
                        }
                    },
                }).wait;
                if (result instanceof QueueError) {
                    console.error(result.error);
                }
            }
        }

        onMounted(async () => {
            srcBuffer = props.src + '';
            await init();
        });

        onBeforeUpdate(async () => {
            if (srcBuffer !== props.src) {
                srcBuffer = props.src + '';
                await init();
            }
        });

        return () => {
            return (
                <div
                    ref={container}
                    class="icon"
                    data-src={props.src}
                    title={props.title}
                />
            );
        };
    },
});
