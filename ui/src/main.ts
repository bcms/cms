import './styles/_main.scss';
import { createApp } from 'vue';
import { createBcmsSdk } from '@becomes/cms-sdk';
import './types';
import { bcmsStore } from './store';
import { App } from './app';
import router from './router';
import { cy, clickOutside, tooltip } from './directives';
import {
  createBcmsHeadMetaService,
  createBcmsMarkdownService,
  createBcmsModalService,
  createBcmsNotificationService,
  createBcmsTooltipService,
  useBcmsHeadMetaService,
  useBcmsMarkdownService,
  useBcmsModalService,
  useBcmsNotificationService,
  useBcmsTooltipService,
  createBcmsConfirmService,
  useBcmsConfirmService,
  createBcmsEntryService,
  useBcmsEntryService,
  createBcmsMediaService,
  useBcmsMediaService,
  createBcmsPropService,
  useBcmsPropService,
  createBCMSGlobalSearchService,
} from './services';
import {
  createBcmsColorUtility,
  createBcmsObjectUtility,
  initializeUserLocationsWatcher,
  useBcmsObjectUtility,
  useThrowable,
} from './util';
import { useRoute } from 'vue-router';
import type { BCMSSdk, BCMSSocketMessageEvent } from '@becomes/cms-sdk/types';
import { BCMSSocketEventName } from '@becomes/cms-sdk/types';
import type { BCMSGlobalScopeCloud, BCMSGlobalScopeMain } from './types';

createBcmsObjectUtility();
createBcmsConfirmService();
createBcmsHeadMetaService();
createBcmsMarkdownService();
createBcmsNotificationService();
createBcmsTooltipService();
createBcmsModalService();
createBcmsPropService();
createBcmsEntryService();
createBcmsMediaService();

declare global {
  const bcms: BCMSSdk;
  interface Window {
    // Is declared in components/content/node-nav.vue
    editorNodeEnter(data: { element: HTMLElement }): void;
    editorNodeLeave(data: { element: HTMLElement }): void;

    bcms: BCMSGlobalScopeMain<unknown, unknown>;
    bcmsCloud: BCMSGlobalScopeCloud;
  }
}

if (!window.bcms) {
  window.bcms = {
    origin: '',
    vue: {
      router,
      route: useRoute,
      store: bcmsStore,
    },
    confirm: useBcmsConfirmService(),
    meta: useBcmsHeadMetaService(),
    markdown: useBcmsMarkdownService(),
    notification: useBcmsNotificationService(),
    tooltip: useBcmsTooltipService(),
    modal: useBcmsModalService(),
    prop: useBcmsPropService(),
    entry: useBcmsEntryService(),
    media: useBcmsMediaService(),
    globalSearch: createBCMSGlobalSearchService(),
    util: {
      throwable: useThrowable(),
      string: undefined as never,
      date: undefined as never,
      object: useBcmsObjectUtility(),
      color: createBcmsColorUtility(),
    },
    sdk: undefined as never,
    editorLinkMiddleware: {},
  };
}
window.bcms.sdk = createBcmsSdk({
  cache: {
    fromVuex: bcmsStore,
  },
});
window.bcms.util.date = window.bcms.sdk.util.date;
window.bcms.util.string = window.bcms.sdk.util.string;

window.bcms.sdk.socket.subscribe(BCMSSocketEventName.MESSAGE, async (event) => {
  const ev = event as BCMSSocketMessageEvent;
  if (ev.m === 'm1') {
    window.bcms.notification.warning(
      `A new version of this entry was created. To view or edit, refresh your browser or open the entry in a new tab.`,
    );
  }
});

const app = createApp(App);
app.directive('cy', cy);
app.directive('clickOutside', clickOutside);
app.directive('tooltip', tooltip);
app.use(bcmsStore).use(router).mount('#bcms-container');

initializeUserLocationsWatcher();
