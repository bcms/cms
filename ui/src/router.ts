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
        titleKey?: string;
        titleParams?: Record<string, unknown>;
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
            titleKey: 'routes.login',
            layout: 'AuthLayout',
        },
        component: LoginView,
    },
    {
        path: '/signup-admin',
        name: 'SignupAdminView',
        meta: {
            titleKey: 'routes.signupAdmin',
            layout: 'AuthLayout',
        },
        component: () =>
            import(/* webpackChunkName: "login" */ './views/signup-admin'),
    },
    {
        path: '/d',
        name: 'HomeView',
        meta: {
            titleKey: 'routes.home',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "home" */ './views/dashboard/home'),
    },
    {
        path: '/d/template',
        name: 'TemplatesView',
        meta: {
            titleKey: 'routes.templates',
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
            titleKey: 'routes.template',
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
            titleKey: 'routes.groups',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "group" */ './views/dashboard/groups'),
    },
    {
        path: '/d/group/:groupId',
        name: 'GroupView',
        meta: {
            titleKey: 'routes.group',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "group" */ './views/dashboard/group'),
    },
    {
        path: '/d/widget',
        name: 'WidgetsView',
        meta: {
            titleKey: 'routes.widgets',
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
            titleKey: 'routes.widget',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(
                /* webpackChunkName: "widget" */ './views/dashboard/widget'
            ),
    },
    {
        path: '/d/media',
        name: 'MediaView',
        meta: {
            titleKey: 'routes.media',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "media" */ './views/dashboard/media'),
    },
    {
        path: '/d/settings',
        name: 'SettingsView',
        meta: {
            titleKey: 'routes.settings',
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
            titleKey: 'routes.apiKeys',
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
            titleKey: 'routes.apiKey',
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
            titleKey: 'routes.entries',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "entry" */ './views/dashboard/entries'),
    },
    {
        path: '/d/template/:templateId/entry/:entryId',
        name: 'EntryView',
        meta: {
            titleKey: 'routes.entry',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "entry" */ './views/dashboard/entry'),
    },
    {
        path: '/d/plugin/:pluginId',
        name: 'PluginView',
        meta: {
            titleKey: 'routes.plugin',
            layout: 'DashboardLayout',
        },
        component: () =>
            import(/* webpackChunkName: "plugin" */ './views/dashboard/plugin'),
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'P404View',
        meta: {
            titleKey: 'routes.notFound',
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
