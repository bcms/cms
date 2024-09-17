import './styles/_main.scss';
import './window';
import { createApp } from 'vue';
import { useStore } from '@bcms/selfhosted-ui/store';
import { createSdk } from '@bcms/selfhosted-sdk';
import { Storage } from '@bcms/selfhosted-ui/storage';
import { createHeadMetaService } from '@bcms/selfhosted-ui/services/head-meta';
import { createNotificationService } from '@bcms/selfhosted-ui/services/notification';
import { createTooltipService } from '@bcms/selfhosted-ui/services/tooltip';
import { App } from '@bcms/selfhosted-ui/app';
import { clickOutside, cy, tooltip } from '@bcms/selfhosted-ui/directives';
import { router } from '@bcms/selfhosted-ui/router';
import { throwable } from '@bcms/selfhosted-ui/util/throwable';
import { modalService } from '@bcms/selfhosted-ui/services/modal';
import { useLanguage } from '@bcms/selfhosted-ui/hooks/language';
import { confirm } from '@bcms/selfhosted-ui/services/confirm';
import { useTheme } from '@bcms/selfhosted-ui/hooks/theme';
import { useScreenSize } from '@bcms/selfhosted-ui/hooks/screen';

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
