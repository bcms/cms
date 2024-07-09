import { defineComponent, type PropType } from 'vue';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';

export const EmptyState = defineComponent({
    props: {
        ...DefaultComponentProps,
        maxWidth: {
            type: String,
            required: false,
            default: '100%',
        },
        maxHeight: {
            type: String,
            required: false,
            default: '100%',
        },
        src: {
            type: String,
            required: true,
        },
        alt: {
            type: String,
            required: false,
            default: 'Empty',
        },
        title: {
            required: false,
            type: String,
        },
        subtitle: {
            required: false,
            type: String,
        },
        clickHandler: {
            required: false,
            type: Function as PropType<(_: MouseEvent) => any>,
        },
        ctaText: {
            required: false,
            type: String,
        },
    },
    setup(props) {
        return () => (
            <div class="mt-7 desktop:mt-0">
                <div class="flex items-start justify-between">
                    <div class="flex flex-col space-y-5">
                        {props.title && (
                            <h1 class="text-9.5 -tracking-0.03 leading-none dark:text-light">
                                {props.title}
                            </h1>
                        )}
                        {props.subtitle && (
                            <div class="leading-tight -tracking-0.01 dark:text-grey">
                                {props.subtitle}
                            </div>
                        )}
                    </div>
                    {props.clickHandler && (
                        <Button onClick={props.clickHandler}>
                            {props.ctaText}
                        </Button>
                    )}
                </div>
                <img
                    class={`flex object-contain max-w-full mx-auto ${
                        props.class || ''
                    }`}
                    style={{
                        maxWidth: props.maxWidth,
                        maxHeight: props.maxHeight,
                    }}
                    src={`${window.bcms.origin}/assets/empty-state-illustrations/${props.src}`}
                    alt={props.alt}
                    draggable={false}
                />
            </div>
        );
    },
});
