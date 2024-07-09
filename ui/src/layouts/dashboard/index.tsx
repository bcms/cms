import { computed, defineComponent, onMounted, ref } from 'vue';
import { delay } from '@thebcms/selfhosted-ui/util/delay';
import { useTheme } from '@thebcms/selfhosted-ui/hooks/theme';
import {
    DashboardLayoutNavItem,
    type DashboardLayoutNavItemProps,
} from '@thebcms/selfhosted-ui/layouts/dashboard/nav-item';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { isUserAdmin } from '@thebcms/selfhosted-utils/user-role';
import { BgDashboard } from '@thebcms/selfhosted-ui/components/bg-dashboard';
import { Tag } from '@thebcms/selfhosted-ui/components/tag';
import { UserAvatar } from '@thebcms/selfhosted-ui/components/user-avatar';
import { Dropdown } from '@thebcms/selfhosted-ui/components/dropdown';
import { BCMSLogo } from '@thebcms/selfhosted-ui/components/logo';

export const DashboardLayout = defineComponent({
    setup(_, ctx) {
        const sdk = window.bcms.sdk;
        const pageTransition = window.bcms.pageTransition();
        const modal = window.bcms.modalService;
        const throwable = window.bcms.throwable;
        const theme = useTheme();

        const baseUri = ref('/d');
        const [t1State] = pageTransition.register(() => delay(300));
        const [t2State] = pageTransition.register(() => delay(300));
        const me = computed(() => sdk.store.user.methods.me());
        const templates = computed(() => sdk.store.template.items());

        function navItemSlot(name: string, src: string) {
            return (
                <div class={'flex gap-4 w-full '}>
                    <div
                        class={`group-hover:text-green dark:group-hover:text-yellow duration-300 transition-all`}
                    >
                        {name}
                    </div>
                    <div class={`ml-auto`}>
                        <Icon
                            class={`fill-current transition-all duration-300 w-5 h-5 group-hover:text-green group-focus-visible:text-green desktop:w-6 desktop:h-6 dark:group-hover:text-yellow dark:group-focus-visible:text-yellow`}
                            src={src}
                        />
                    </div>
                </div>
            );
        }

        const navItems = computed(() => {
            const myPolicy = me.value?.customPool.policy;
            if (!myPolicy) {
                return [];
            }
            const isAdmin = isUserAdmin(me.value);
            const items: DashboardLayoutNavItemProps[] = [];
            items.push(
                {
                    title: 'Administration',
                    activeOnViews: [
                        'HomeView',
                        'TemplatesView',
                        'TemplateView',
                        'GroupsView',
                        'GroupView',
                        'WidgetsView',
                        'MediaView',
                        'SettingsView',
                        'ApiKeysView',
                        'ApiKeyView',
                    ],
                    visible: true,
                    children: [
                        {
                            title: 'Templates',
                            href: `/d/template`,
                            activeOnViews: ['TemplatesView', 'TemplateView'],
                            visible: isAdmin,
                            titleSlot: () =>
                                navItemSlot(
                                    'Templates',
                                    '/administration/template',
                                ),
                        },
                        {
                            title: 'Groups',
                            href: `/d/group`,
                            activeOnViews: ['GroupsView', 'GroupsView'],
                            visible: isAdmin,
                            titleSlot: () =>
                                navItemSlot('Groups', '/administration/group'),
                        },
                        {
                            title: 'Widgets',
                            href: `${baseUri.value}/widget`,
                            activeOnViews: ['WidgetsView'],
                            visible: isAdmin,
                            titleSlot: () =>
                                navItemSlot(
                                    'Widgets',
                                    '/administration/widget',
                                ),
                        },
                        {
                            title: 'Media',
                            href: `${baseUri.value}/media`,
                            activeOnViews: ['MediaView'],
                            visible: isAdmin || myPolicy.media.get,
                            titleSlot: () =>
                                navItemSlot('Media', '/administration/media'),
                        },
                        {
                            title: 'Settings',
                            href: `${baseUri.value}/settings`,
                            activeOnViews: ['SettingsView'],
                            visible: isAdmin,
                            titleSlot: () => navItemSlot('Settings', '/cog'),
                        },
                        {
                            title: 'API Keys',
                            href: `${baseUri.value}/api-key`,
                            activeOnViews: ['ApiKeysView', 'ApiKeyView'],
                            visible: isAdmin,
                            titleSlot: () =>
                                navItemSlot(
                                    'Key manager',
                                    '/administration/key',
                                ),
                        },
                    ],
                },
                {
                    title: 'Entries',
                    activeOnViews: [],
                    visible: true,
                    children: templates.value
                        .map((template) => {
                            const templatePolicy = myPolicy.templates.find(
                                (e) => e._id === template._id,
                            );
                            return {
                                title: template.label,
                                activeOnViews: [
                                    ('BCMSEntriesView' + template.name) as any,
                                    ('BCMSEntryView' + template.name) as any,
                                ],
                                visible:
                                    isAdmin ||
                                    (!!template && templatePolicy?.get),
                                href: `/d/template/${template.name}/entry`,
                                titleSlot: () => (
                                    <div class={'flex gap-2'}>
                                        <Icon src={'/cube'} />
                                        <div>{template.label}</div>
                                    </div>
                                ),
                            };
                        })
                        .sort((a, b) =>
                            a.title.toLowerCase() > b.title.toLowerCase()
                                ? 1
                                : -1,
                        ),
                },
            );
            return items;
        });

        async function logout() {
            await throwable(
                async () => {
                    await sdk.auth.logout();
                },
                async () => {
                    window.location.pathname = '/';
                },
            );
        }

        onMounted(async () => {
            await throwable(async () => {
                await sdk.user.get('me');
                await sdk.template.getAll();
            });
        });

        return () => (
            <div class={`flex`}>
                <BgDashboard
                    class={`transition-all duration-300 ${
                        t1State.value === 'in' || t1State.value === 'in-done'
                            ? 'opacity-100'
                            : 'opacity-0'
                    }`}
                />
                <div class={`relative flex w-full z-10`}>
                    <main
                        class={`relative ${
                            t2State.value === 'in' ||
                            t2State.value === 'in-done'
                                ? 'top-0 opacity-100'
                                : 'top-48 opacity-0'
                        } transition-all duration-300 pl-[338px] py-[51px] pr-6 w-full min-h-screen text-black dark:text-white`}
                    >
                        {ctx.slots.default ? ctx.slots.default() : ''}
                    </main>
                    <aside
                        class={`${
                            t1State.value === 'in' ||
                            t1State.value === 'in-done'
                                ? 'left-0'
                                : 'left-[-312px]'
                        } transition-all duration-300 fixed top-0 flex flex-col gap-6 px-6 py-8 h-screen overflow-y-auto overflow-x-hidden border-r border-r-gray/50 dark:border-r-darkGray/50 w-[312px]`}
                    >
                        <div class={`flex gap-4 items-center`}>
                            <BCMSLogo />
                        </div>
                        <button
                            class={`mt-6 border border-gray dark:border-darkGray bg-white/50 dark:bg-dark/50 text-black dark:text-white rounded-2.5 flex gap-2 items-center px-[16px] py-[10px]`}
                        >
                            <Icon
                                class={`w-3 h-3 text-dark dark:text-white fill-current`}
                                src={'/search'}
                            />
                            <div>Search</div>
                            <Tag
                                class={`flex-shrink-0 ml-auto mt-auto mb-auto text-black`}
                            >
                                Ctrl+K
                            </Tag>
                        </button>
                        <div
                            class={`flex flex-col gap-6 h-full overflow-y-auto overflow-x-hidden mt-6 w-full`}
                        >
                            {navItems.value.map((item) => {
                                return (
                                    <DashboardLayoutNavItem
                                        class={`w-full`}
                                        item={item}
                                    />
                                );
                            })}
                        </div>
                        <div
                            class={`flex gap-8 pt-[24px] border-t border-t-gray/50 dark:border-t-darkGray/50`}
                        >
                            <button
                                class={`flex gap-2 items-center text-left`}
                                onClick={() => {
                                    modal.handlers.userAddEdit.open({
                                        data: {
                                            userId: me.value?._id,
                                        },
                                    });
                                }}
                            >
                                <UserAvatar
                                    fullName={me.value?.username}
                                    image={
                                        me.value?.customPool.personal.avatarUri
                                    }
                                />
                                <div class={'flex flex-col'}>
                                    <div
                                        class={`text-sm text-darkGray dark:text-gray font-bold`}
                                    >
                                        {me.value?.username}
                                    </div>
                                    <div
                                        class={`text-xs text-darkGray dark:text-gray`}
                                    >
                                        {me.value?.email}
                                    </div>
                                </div>
                            </button>
                            <Dropdown
                                class={`ml-auto`}
                                fixed
                                items={[
                                    {
                                        text: 'Settings',
                                        icon: '/cog',
                                        onClick: async () => {
                                            modal.handlers.userAddEdit.open({
                                                data: {
                                                    userId: me.value?._id,
                                                },
                                            });
                                        },
                                    },
                                    {
                                        text:
                                            theme.active.value === 'light'
                                                ? 'Dark mode'
                                                : 'Light mode',
                                        border: true,
                                        onClick: () => {
                                            theme.set(
                                                theme.active.value === 'light'
                                                    ? 'dark'
                                                    : 'light',
                                            );
                                        },
                                    },
                                    {
                                        text: 'Twitter @thebcms',
                                        onClick: () => {
                                            window.location.href =
                                                'https://x.com/@thebcms';
                                        },
                                    },
                                    {
                                        text: 'Terms & privacy',
                                        onClick: () => {
                                            window.location.href =
                                                'https://thebcms.com/terms-and-conditions';
                                        },
                                    },
                                    {
                                        text: 'Support',
                                        border: true,
                                        onClick: () => {
                                            window.location.href =
                                                'https://thebcms.com/contact';
                                        },
                                    },
                                    {
                                        text: 'Log out',
                                        icon: '/sign-out',
                                        onClick: async () => {
                                            await logout();
                                        },
                                    },
                                ]}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        );
    },
});
