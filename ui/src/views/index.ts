import { LoginView } from '@bcms/selfhosted-ui/views/login';
import { P404View } from './404';
import SignupAdminView from './signup-admin';
import HomeView from './dashboard/home';
import TemplatesView from './dashboard/templates';
import GroupsView from './dashboard/groups';
import WidgetsView from './dashboard/widgets';
import MediaView from './dashboard/media';
import TemplateView from '@bcms/selfhosted-ui/views/dashboard/template';
import GroupView from './dashboard/group';
import WidgetView from './dashboard/widget';
import SettingsView from './dashboard/settings';
import ApiKeysView from './dashboard/api-keys';
import ApiKeyView from './dashboard/api-key';
import EntriesView from './dashboard/entries';
import EntryView from './dashboard/entry';
import PluginView from '@bcms/selfhosted-ui/views/dashboard/plugin';

export const views = {
    LoginView,
    SignupAdminView,
    HomeView,

    TemplatesView,
    TemplateView,

    GroupsView,
    GroupView,

    WidgetsView,
    WidgetView,

    MediaView,

    SettingsView,

    ApiKeysView,
    ApiKeyView,

    EntriesView,
    EntryView,

    PluginView,

    P404View,
};

export type ViewNames = keyof typeof views;
