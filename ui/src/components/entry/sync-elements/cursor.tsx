import {
    computed,
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
} from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';

export const EntrySyncElementsUserCursor = defineComponent({
    props: {
        ...DefaultComponentProps,
        name: {
            type: String,
            required: true,
        },
        x: {
            type: Number,
            required: true,
        },
        y: {
            type: Number,
            required: true,
        },
        scrollY: {
            type: Number,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const myScrollY = ref(0);
        const position = computed(() => {
            if (props.x !== -1 && props.y !== -1) {
                return {
                    top:
                        props.y +
                        (props.scrollY === -1
                            ? 0
                            : props.scrollY - myScrollY.value),
                    left: props.x,
                };
            }
            return undefined;
        });
        let debounceTimeout: NodeJS.Timeout;

        function onScroll() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                myScrollY.value = document.body.scrollTop;
            }, 100);
        }

        onMounted(() => {
            document.body.addEventListener('scroll', onScroll);
        });

        onBeforeUnmount(() => {
            document.body.removeEventListener('scroll', onScroll);
        });

        return () => (
            <>
                {position.value && (
                    <div
                        id={props.id}
                        class={`fixed z-100 ${props.class || ''}`}
                        style={`top: ${position.value.top}px; left: ${
                            position.value.left
                        }px; ${props.style || ''}`}
                    >
                        <div class={`relative`}>
                            <Icon
                                src={`/arrow-left`}
                                class={`w-3 h-3 fill-current rotate-[45deg]`}
                                style={`stroke: ${props.color};`}
                            />
                            <div
                                class={`absolute text-xs leading-3 p-1 rounded`}
                                style={`top: 10px; left: 10px; background-color: ${props.color};`}
                            >
                                {props.name}
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    },
});
