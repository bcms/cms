import { computed, defineComponent, onMounted, ref } from 'vue';
import { BCMSLogo } from '@thebcms/selfhosted-ui/components/logo';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import { Tag } from '@thebcms/selfhosted-ui/components/tag';
import {
    DashboardLayoutNavItem,
    type DashboardLayoutNavItemProps,
} from '@thebcms/selfhosted-ui/layouts/dashboard/nav-item';
import { UserAvatar } from '@thebcms/selfhosted-ui/components/user-avatar';
import { Dropdown } from '@thebcms/selfhosted-ui/components/dropdown';
import { isUserAdmin } from '@thebcms/selfhosted-ui/util/user-role';
import type { PluginList } from '@thebcms/selfhosted-backend/plugin/models/controller';

export const DashboardLayoutAsideContent = defineComponent({
    emits: {
        closeNav: () => true,
    },
    setup(_, ctx) {
        const sdk = window.bcms.sdk;
        const modal = window.bcms.modalService;
        const theme = window.bcms.useTheme();
        const throwable = window.bcms.throwable;

        const me = computed(() => sdk.store.user.methods.me());
        const templates = computed(() => sdk.store.template.items());
        const baseUri = ref('/d');
        const plugins = ref<PluginList>();

        const navItems = computed(() => {
            const myPolicy = me.value?.customPool.policy;
            if (!myPolicy) {
                return [];
            }
            const isAdmin = isUserAdmin(me.value);
            const items: DashboardLayoutNavItemProps[] = [];
            items.push({
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
                        onClick() {
                            ctx.emit('closeNav');
                        },
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
                        onClick() {
                            ctx.emit('closeNav');
                        },
                        titleSlot: () =>
                            navItemSlot('Groups', '/administration/group'),
                    },
                    {
                        title: 'Widgets',
                        href: `${baseUri.value}/widget`,
                        activeOnViews: ['WidgetsView'],
                        visible: isAdmin,
                        onClick() {
                            ctx.emit('closeNav');
                        },
                        titleSlot: () =>
                            navItemSlot('Widgets', '/administration/widget'),
                    },
                    {
                        title: 'Media',
                        href: `${baseUri.value}/media`,
                        activeOnViews: ['MediaView'],
                        visible: isAdmin || myPolicy.media.get,
                        onClick() {
                            ctx.emit('closeNav');
                        },
                        titleSlot: () =>
                            navItemSlot('Media', '/administration/media'),
                    },
                    {
                        title: 'Settings',
                        href: `${baseUri.value}/settings`,
                        activeOnViews: ['SettingsView'],
                        visible: isAdmin,
                        onClick() {
                            ctx.emit('closeNav');
                        },
                        titleSlot: () => navItemSlot('Settings', '/cog'),
                    },
                    {
                        title: 'API Keys',
                        href: `${baseUri.value}/api-key`,
                        activeOnViews: ['ApiKeysView', 'ApiKeyView'],
                        visible: isAdmin,
                        onClick() {
                            ctx.emit('closeNav');
                        },
                        titleSlot: () =>
                            navItemSlot('Key manager', '/administration/key'),
                    },
                ],
            });
            if (plugins.value && plugins.value.list.length > 0) {
                items.push({
                    title: 'Plugins',
                    activeOnViews: ['PluginView'],
                    visible: true,
                    children: plugins.value.list.map((plugin) => {
                        return {
                            title: plugin.name,
                            activeOnViews: [('PluginView' + plugin.id) as any],
                            visible: true,
                            href: `/d/plugin/${plugin.id}`,
                            onClick() {
                                ctx.emit('closeNav');
                            },
                            titleSlot: () => (
                                <div class={'flex gap-2'}>
                                    <div>{plugin.name}</div>
                                </div>
                            ),
                        };
                    }),
                });
            }
            items.push({
                title: 'Entries',
                activeOnViews: ['EntriesView', 'EntryView'],
                visible: true,
                children: templates.value
                    .map((template) => {
                        const templatePolicy = myPolicy.templates.find(
                            (e) => e._id === template._id,
                        );
                        return {
                            title: template.label,
                            activeOnViews: [
                                ('EntriesView' + template._id) as any,
                                ('EntryView' + template._id) as any,
                            ],
                            visible:
                                isAdmin || (!!template && templatePolicy?.get),
                            href: `/d/template/${template._id}/entry`,
                            onClick() {
                                ctx.emit('closeNav');
                            },
                            titleSlot: () => (
                                <div class={'flex gap-2'}>
                                    <div>{template.label}</div>
                                </div>
                            ),
                        };
                    })
                    .sort((a, b) =>
                        a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1,
                    ),
            });
            return items;
        });

        onMounted(async () => {
            await throwable(
                async () => {
                    return await sdk.plugin.getAll();
                },
                async (result) => {
                    plugins.value = result;
                },
            );
        });

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

        return () => (
            <>
                <div class={`flex gap-4 items-center px-6 pt-14`}>
                    <BCMSLogo />
                    <button
                        class={`ml-auto hidden max-desktop:block`}
                        onClick={() => {
                            ctx.emit('closeNav');
                        }}
                    >
                        <Icon
                            class={`w-10 text-dark dark:text-white fill-current`}
                            src={`/close`}
                        />
                    </button>
                </div>
                <button
                    class={`mt-14 px-6 mx-6 border border-gray dark:border-darkGray bg-white/50 dark:bg-dark/50 text-black dark:text-white rounded-2.5 flex gap-2 items-center py-[10px]`}
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
                <div class={`relative h-full flex flex-col overflow-hidden`}>
                    <div
                        class={`flex flex-col gap-6 h-full overflow-y-auto overflow-x-hidden mt-10 px-6 pb-6 w-full bcmsScrollbar`}
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
                </div>
                <div
                    class={`flex gap-8 pt-[24px] mx-6 mb-8 border-t border-t-gray/50 dark:border-t-darkGray/50`}
                >
                    <button
                        class={`flex gap-2 items-center text-left`}
                        onClick={() => {
                            ctx.emit('closeNav');
                            modal.handlers.userAddEdit.open({
                                data: {
                                    userId: me.value?._id,
                                },
                            });
                        }}
                    >
                        <UserAvatar
                            fullName={me.value?.username}
                            image={me.value?.customPool.personal.avatarUri}
                        />
                        <div class={'flex flex-col'}>
                            <div
                                class={`text-sm text-darkGray dark:text-gray font-bold`}
                            >
                                {me.value?.username}
                            </div>
                            <div class={`text-xs text-darkGray dark:text-gray`}>
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
                                    ctx.emit('closeNav');
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
                                    ctx.emit('closeNav');
                                    await logout();
                                },
                            },
                        ]}
                    />
                </div>
            </>
        );
    },
});
