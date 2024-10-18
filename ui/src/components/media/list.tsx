import { defineComponent, type PropType } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import type { Media } from '@bcms/selfhosted-backend/media/models/main';
import { MediaListItem } from '@bcms/selfhosted-ui/components/media/list-item';

export const MediaList = defineComponent({
    props: {
        ...DefaultComponentProps,
        items: {
            type: Array as PropType<Media[]>,
            required: true,
        },
    },
    emits: {
        click: (_media: Media, _event?: MouseEvent) => true,
    },
    setup(props, ctx) {
        return () => (
            <ul
                id={props.id}
                style={props.style}
                class={`list-none grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[15px] desktop:gap-x-5 desktop:gap-y-7.5 ${props.class}`}
            >
                {props.items.map((item) => {
                    return (
                        <MediaListItem
                            item={item}
                            onClick={(media, event) => {
                                ctx.emit('click', media, event);
                            }}
                        />
                    );
                })}
            </ul>
        );
    },
});
