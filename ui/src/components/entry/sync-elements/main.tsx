import { computed, defineComponent, type PropType, Teleport } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import type {
    EntrySync,
    EntrySyncUserData,
} from '@thebcms/selfhosted-ui/services/entry-sync';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';
import { EntrySyncElementsAvatar } from '@thebcms/selfhosted-ui/components/entry/sync-elements/avatar';
import { EntrySyncElementsUserCursor } from '@thebcms/selfhosted-ui/components/entry/sync-elements/cursor';
import { EntrySyncElementsFocusAvatar } from '@thebcms/selfhosted-ui/components/entry/sync-elements/focus-avatar';

export const EntrySyncElements = defineComponent({
    props: {
        ...DefaultComponentProps,
        entrySync: {
            type: Object as PropType<EntrySync>,
            required: true,
        },
    },
    setup(props) {
        const sdk = window.bcms.sdk;
        const syncUsers = computed(() => {
            const output: Array<{
                user: UserProtected;
                data: EntrySyncUserData;
            }> = [];
            for (let i = 0; i < props.entrySync.users.value.length; i++) {
                const data = props.entrySync.users.value[i];
                const user = sdk.store.user.findById(data.userId);
                if (user) {
                    output.push({ user, data });
                }
            }
            return output;
        });

        return () => (
            <>
                {syncUsers.value.map((info) => {
                    return (
                        <>
                            <Teleport
                                to={`[id="entrySync-connected-users-container"]`}
                            >
                                <EntrySyncElementsAvatar
                                    name={
                                        info.user.customPool.personal
                                            .firstName +
                                        ' ' +
                                        info.user.customPool.personal.lastName
                                    }
                                    avatar={
                                        info.user.customPool.personal.avatarUri
                                    }
                                    color={info.data.color.main}
                                />
                            </Teleport>
                            <Teleport to={`body`}>
                                <EntrySyncElementsUserCursor
                                    x={info.data.mouse.x}
                                    y={info.data.mouse.y}
                                    color={info.data.color.main}
                                    scrollY={info.data.scroll.y}
                                    name={info.user.username}
                                />
                            </Teleport>

                            {info.data.focusOn && (
                                <Teleport to={`body`}>
                                    <EntrySyncElementsFocusAvatar
                                        name={info.user.username}
                                        avatar={
                                            info.user.customPool.personal
                                                .avatarUri
                                        }
                                        color={info.data.color.main}
                                        focusOn={info.data.focusOn}
                                    />
                                </Teleport>
                            )}
                        </>
                    );
                })}
            </>
        );
    },
});
