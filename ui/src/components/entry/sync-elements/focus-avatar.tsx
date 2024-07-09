import { computed, defineComponent } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { EntrySyncElementsAvatar } from '@thebcms/selfhosted-ui/components/entry/sync-elements/avatar';

export const EntrySyncElementsFocusAvatar = defineComponent({
    props: {
        ...DefaultComponentProps,
        name: {
            type: String,
            required: true,
        },
        avatar: String,
        color: {
            type: String,
            required: true,
        },
        focusOn: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const avatarPosition = computed(() => {
            if (!props.focusOn) {
                return null;
            }
            const focusEl = document.getElementById(props.focusOn);
            if (focusEl) {
                const bBox = focusEl.getBoundingClientRect();
                return {
                    x: bBox.width + bBox.left,
                    y: bBox.top + document.body.scrollTop,
                };
            }
            return null;
        });
        return () => (
            <>
                {avatarPosition.value && (
                    <EntrySyncElementsAvatar
                        class={`absolute z-100`}
                        color={props.color}
                        style={`top: ${avatarPosition.value.y}px; left: ${avatarPosition.value.x}px;`}
                        avatar={props.avatar}
                        name={props.name}
                    />
                )}
            </>
        );
    },
});
