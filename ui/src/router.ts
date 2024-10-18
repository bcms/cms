import {
    createRouter,
    createWebHistory,
    type NavigationGuardNext,
    type RouteRecordRaw,
} from 'vue-router';
import type { ViewNames } from '@bcms/selfhosted-ui/views';
import type { LayoutNames } from '@bcms/selfhosted-ui/layouts';
import type { DefineComponent } from 'vue';
import { LoginView } from '@bcms/selfhosted-ui/views/login';

interface RouteRecordRawExtended
    extends Omit<RouteRecordRaw, 'name' | 'children' | 'meta'> {
    name?: ViewNames;
    children?: Array<RouteRecordRawExtended>;
    meta?: {
        title?: string;
        layout?: LayoutNames;
        class?: string;
        boxClass?: string;
        heading?: string;
        headingBack?: boolean | string;
        overrideComponent?: DefineComponent<
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any,
            any
        >;
    };
}

const routes: Array<RouteRecordRawExtended> = [
    {
        path: '/',
        name: 'LoginView',
        meta: {
            title: 'Login',
            layout: 'AuthLayout',
        },
        component: LoginView,
    },
    {
        path: '/signup-admin',
        name: 'SignupAdminView',
        meta: {
            title: 'Admin sign up',
            layout: 'AuthLayout',
        },
        component: () =>
            import(/* webpackChunkName: "login" */ './views/signup-admin'),
    },
    {
        path: '/d',
        name: 'HomeView',
        meta: {
            title: 'Home',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "home" */ './views/dashboard/home'),
    },
    {
        path: '/d/template',
        name: 'TemplatesView',
        meta: {
            title: 'Templates',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "template" */ './views/dashboard/templates'
            ),
    },
    {
        path: '/d/template/:templateId',
        name: 'TemplateView',
        meta: {
            title: 'Template',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "template" */ './views/dashboard/template'
            ),
    },
    {
        path: '/d/group',
        name: 'GroupsView',
        meta: {
            title: 'Groups',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "group" */ './views/dashboard/groups'),
    },
    {
        path: '/d/group/:groupId',
        name: 'GroupView',
        meta: {
            title: 'Group',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "group" */ './views/dashboard/group'),
    },
    {
        path: '/d/widget',
        name: 'WidgetsView',
        meta: {
            title: 'Widgets',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "widget" */ './views/dashboard/widgets'
            ),
    },
    {
        path: '/d/widget/:widgetId',
        name: 'WidgetView',
        meta: {
            title: 'Widget',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "widget" */ './views/dashboard/widget'),
    },
    {
        path: '/d/media',
        name: 'MediaView',
        meta: {
            title: 'Media manager',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "media" */ './views/dashboard/media'),
    },
    {
        path: '/d/settings',
        name: 'SettingsView',
        meta: {
            title: 'Settings',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "settings" */ './views/dashboard/settings'
            ),
    },
    {
        path: '/d/api-key',
        name: 'ApiKeysView',
        meta: {
            title: 'API Keys',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "api-key" */ './views/dashboard/api-keys'
            ),
    },
    {
        path: '/d/api-key/:apiKeyId',
        name: 'ApiKeyView',
        meta: {
            title: 'API Key',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "api-key" */ './views/dashboard/api-key'
            ),
    },
    {
        path: '/d/template/:templateId/entry',
        name: 'EntriesView',
        meta: {
            title: 'Entries',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "entry" */ './views/dashboard/entries'),
    },
    {
        path: '/d/template/:templateId/entry/:entryId',
        name: 'EntryView',
        meta: {
            title: 'Entry',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "entry" */ './views/dashboard/entry'),
    },
    {
        path: '/d/plugin/:pluginId',
        name: 'PluginView',
        meta: {
            title: 'Plugin',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "plugin" */ './views/dashboard/plugin'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'P404View',
        meta: {
            title: 'Oops! Page not found',
            layout: 'NoneLayout',
        },
        component: () => import(/* webpackChunkName: "p404" */ './views/404'),
    },
];

export const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes: routes as any,
});

const publicRoutes = ['/', '/login', '/rest-docs/v3', '/signup-admin'];

function toLogin(next: NavigationGuardNext) {
    const query = window.location.href.split('?');
    let url = window.location.pathname;
    if (query[1]) {
        url = url + '?' + query[1];
    }
    next({
        path: '/',
        query: {
            forward: url,
        },
    });
}

router.beforeEach(async (to, _, next) => {
    const jwt = window.bcms.sdk.accessToken;
    if (to.name === 'P404View') {
        next();
    } else if (publicRoutes.includes(to.path)) {
        next();
    } else if ((await window.bcms.sdk.isLoggedIn()) && jwt) {
        next();
    } else {
        toLogin(next);
    }
});
