import { defineComponent } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { UserAvatar } from '@thebcms/selfhosted-ui/components/user-avatar';

export const EntrySyncElementsAvatar = defineComponent({
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
    },
    setup(props) {
        return () => (
            <div
                id={props.id}
                class={`p-1 rounded-full ${props.class}`}
                style={`background-color: ${props.color}; ${props.style || ''}`}
                title={props.name}
            >
                <UserAvatar fullName={props.name} image={props.avatar} />
            </div>
        );
    },
});
