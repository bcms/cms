import './styles/_main.scss';
import './window';
import { createApp } from 'vue';
import { useStore } from '@thebcms/selfhosted-ui/store';
import { createSdk } from '@thebcms/selfhosted-sdk';
import { Storage } from '@thebcms/selfhosted-ui/storage';
import { createHeadMetaService } from '@thebcms/selfhosted-ui/services/head-meta';
import { createNotificationService } from '@thebcms/selfhosted-ui/services/notification';
import { createTooltipService } from '@thebcms/selfhosted-ui/services/tooltip';
import { App } from '@thebcms/selfhosted-ui/app';
import { clickOutside, cy, tooltip } from '@thebcms/selfhosted-ui/directives';
import { router } from '@thebcms/selfhosted-ui/router';
import { throwable } from '@thebcms/selfhosted-ui/util/throwable';
import { modalService } from '@thebcms/selfhosted-ui/services/modal';
import { useLanguage } from '@thebcms/selfhosted-ui/hooks/language';
import { confirm } from '@thebcms/selfhosted-ui/services/confirm';
import { useTheme } from '@thebcms/selfhosted-ui/hooks/theme';
import { useScreenSize } from '@thebcms/selfhosted-ui/hooks/screen';

const sdk = createSdk(useStore(), Storage, {
    debug: ['all'],
});

window.bcms = {
    sdk,
    meta: createHeadMetaService(),
    origin: window.location.href.split('/').slice(0, 3).join('/'),
    notification: createNotificationService(),
    tooltip: createTooltipService(),
    useLanguage,
    useTheme,
    useScreenSize,
    pageTransition: null as never,
    modalService,
    throwable,
    confirm,
    entryPropValidator: null as never,
};

const app = createApp(App);
app.directive('clickOutside', clickOutside);
app.directive('tooltip', tooltip);
app.directive('cy', cy);
app.use(router).mount('#bcms-app');
