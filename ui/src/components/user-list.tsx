import { computed, defineComponent, onMounted, type PropType } from 'vue';
import { DefaultComponentProps } from '@bcms/selfhosted-ui/components/default';
import { throwable } from '@bcms/selfhosted-ui/util/throwable';
import { UserAvatar } from '@bcms/selfhosted-ui/components/user-avatar';
import { Tag } from '@bcms/selfhosted-ui/components/tag';
import { userHasRole } from '@bcms/selfhosted-ui/util/role';
import {
    Dropdown,
    type DropdownItem,
} from '@bcms/selfhosted-ui/components/dropdown';
import { confirm } from '@bcms/selfhosted-ui/services/confirm';
import { Button } from '@bcms/selfhosted-ui/components/button';
import type { UserProtected } from '@bcms/selfhosted-backend/user/models/main';
import { useI18n } from 'vue-i18n';

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
        const { t } = useI18n();
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

        const dropdownOptions = computed<DropdownItem[]>(() => [
            {
                text: dropdownItem(
                    t('users.editProfile'),
                    t('users.editProfileDesc'),
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
                    t('users.detailedPermissions'),
                    t('users.detailedPermissionsDesc'),
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
                    t('users.removeFromInstance'),
                    t('users.removeFromInstanceDesc'),
                    undefined,
                    'text-darkGray',
                ),
                icon: '/trash',
                danger: true,
                async onClick() {
                    if (
                        await confirm(
                            t('users.removeUser'),
                            t('users.removeConfirm'),
                        )
                    ) {
                        await throwable(
                            async () => {
                                await sdk.user.deleteById(props.user._id);
                            },
                            async () => {
                                notification.success(t('users.removed'));
                            },
                        );
                    }
                },
            },
        ]);

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
                        {(() => {
                            const roleName =
                                props.user.roles[0].name.toUpperCase();
                            if (roleName === 'ADMIN') {
                                return t('users.roleAdmin');
                            }
                            if (roleName === 'USER') {
                                return t('users.roleUser');
                            }
                            return props.user.roles[0].name;
                        })()}
                    </Tag>
                </div>
                {props.me._id !== props.user._id &&
                    userHasRole(['ADMIN'], props.me) && (
                        <Dropdown items={dropdownOptions.value} />
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
        const { t } = useI18n();
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
                    <div class={`text-3xl`}>{t('users.team')}</div>
                    <Button
                        class={`ml-auto`}
                        onClick={() => {
                            modal.handlers.userAddEdit.open();
                        }}
                    >
                        {t('users.addUser')}
                    </Button>
                </div>
                {list()}
            </div>
        );
    },
});
