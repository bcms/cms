import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { DefaultComponentProps } from '@thebcms/selfhosted-ui/components/default';
import { throwable } from '@thebcms/selfhosted-ui/util/throwable';
import { UserAvatar } from '@thebcms/selfhosted-ui/components/user-avatar';
import { Tag } from '@thebcms/selfhosted-ui/components/tag';
import { userHasRole } from '@thebcms/selfhosted-ui/util/role';
import {
    Dropdown,
    type DropdownItem,
} from '@thebcms/selfhosted-ui/components/dropdown';
import { confirm } from '@thebcms/selfhosted-ui/services/confirm';
import { Button } from '@thebcms/selfhosted-ui/components/button';
import type { UserProtected } from '@thebcms/selfhosted-backend/user/models/main';

export const UserListItem = defineComponent({
    props: {
        me: {
            type: Object as PropType<UserProtected>,
            required: true,
        },
        user: {
            type: Object as PropType<UserProtected>,
            required: true,
        },
    },
    setup(props) {
        const sdk = window.bcms.sdk;
        const notification = window.bcms.notification;
        const modal = window.bcms.modalService;

        function dropdownItem(
            title: string,
            description: string,
            titleClass?: string,
            descriptionClass?: string,
        ) {
            return (
                <div class={`flex flex-col gap-2 text-left`}>
                    <div class={`font-medium ${titleClass || ''}`}>{title}</div>
                    <div class={`text-xs ${descriptionClass || 'text-gray'}`}>
                        {description}
                    </div>
                </div>
            );
        }

        const dropdownOptions: DropdownItem[] = [
            {
                text: dropdownItem(
                    'Edit profile',
                    `Change users email, password, name or role`,
                ),
                icon: '/user-03',
                onClick() {
                    modal.handlers.userAddEdit.open({
                        data: {
                            userId: props.user._id,
                        },
                    });
                },
            },
            {
                text: dropdownItem(
                    'Detailed permissions',
                    'Click here to separately choose create, read, update delete permissions for each template.',
                ),
                icon: '/edit-03',
                onClick() {
                    modal.handlers.userPolicy.open({
                        data: {
                            userId: props.user._id,
                        },
                    });
                },
            },
            {
                text: dropdownItem(
                    'Remove user from the instance',
                    'When removed, they won’t have access to any content in the instance and won’t be able to log in into it.',
                    undefined,
                    'text-darkGray',
                ),
                icon: '/trash',
                danger: true,
                async onClick() {
                    if (
                        await confirm(
                            'Remove user',
                            'Are you sure that you want to remove this user from the instance?',
                        )
                    ) {
                        await throwable(
                            async () => {
                                await sdk.user.deleteById(props.user._id);
                            },
                            async () => {
                                notification.success(
                                    'User successfully removed',
                                );
                            },
                        );
                    }
                },
            },
        ];

        return () => (
            <li
                class={`flex flex-col xs:flex-row gap-4 items-center px-5 py-3 rounded-2.5 border bg-white border-gray/50 dark:bg-darkGray`}
            >
                <UserAvatar
                    fullName={props.user.username}
                    image={props.user.customPool.personal.avatarUri}
                />
                <div class={`text-sm font-bold`}>{props.user.username}</div>
                <div class={`text-xs`}>{props.user.email}</div>
                <div class={`flex gap-2 items-center xs:ml-auto`}>
                    <Tag>
                        {props.user.roles[0].name
                            .split('_')
                            .map(
                                (e) => e.slice(0, 1) + e.slice(1).toLowerCase(),
                            )}
                    </Tag>
                </div>
                {props.me._id !== props.user._id &&
                    userHasRole(['ADMIN'], props.me) && (
                        <Dropdown items={dropdownOptions} />
                    )}
            </li>
        );
    },
});

export const UserList = defineComponent({
    props: {
        ...DefaultComponentProps,
    },
    setup(props) {
        const sdk = window.bcms.sdk;
        const modal = window.bcms.modalService;

        const users = computed(() => sdk.store.user.items());
        const me = computed(() => sdk.store.user.methods.me());

        onMounted(async () => {
            await throwable(async () => {
                await sdk.user.getAll();
            });
        });

        function list() {
            if (!me.value) {
                return '';
            }
            const meUser = me.value;
            return (
                <ul class={`flex flex-col gap-3 mt-8`}>
                    {users.value.map((user) => {
                        return <UserListItem user={user} me={meUser} />;
                    })}
                </ul>
            );
        }

        return () => (
            <div id={props.id} style={props.style} class={props.class}>
                <div class={`flex gap-4 items-center`}>
                    <div class={`text-3xl`}>Team</div>
                    <Button
                        class={`ml-auto`}
                        onClick={() => {
                            modal.handlers.userAddEdit.open();
                        }}
                    >
                        Add user
                    </Button>
                </div>
                {list()}
            </div>
        );
    },
});
