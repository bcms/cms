import type {
  BCMSDateUtility,
  BCMSSdk,
  BCMSStringUtility,
  BCMSThrowable,
} from '@becomes/cms-sdk/types';
import type { Editor } from '@tiptap/core';
import type { Ref } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import type { BCMSStore } from './store';
import type {
  BCMSConfirmService,
  BCMSEntryService,
  BCMSGlobalSearchService,
  BCMSHeadMetaService,
  BCMSMarkdownService,
  BCMSMediaService,
  BCMSModalServiceExtended,
  BCMSNotificationService,
  BCMSPropService,
  BCMSTooltipService,
} from './services';
import type { BCMSColorUtility, BCMSObjectUtility } from './util';

export interface BCMSGlobalScopeMain<
  CustomModals = unknown,
  CustomSocketEventsData = unknown
> {
  origin: string;
  vue: {
    router: Router;
    route: () => RouteLocationNormalizedLoaded;
    store: BCMSStore;
  };
  confirm: BCMSConfirmService;
  meta: BCMSHeadMetaService;
  markdown: BCMSMarkdownService;
  notification: BCMSNotificationService;
  tooltip: BCMSTooltipService;
  modal: BCMSModalServiceExtended<CustomModals>;
  prop: BCMSPropService;
  entry: BCMSEntryService;
  media: BCMSMediaService;
  globalSearch: BCMSGlobalSearchService;
  util: {
    throwable: BCMSThrowable;
    string: BCMSStringUtility;
    date: BCMSDateUtility;
    object: BCMSObjectUtility;
    color: BCMSColorUtility;
  };
  sdk: BCMSSdk<CustomSocketEventsData>;
  editor?: Ref<Editor | undefined>;
  editorLinkMiddleware: { [id: string]: (event: MouseEvent) => void };
}

export interface BCMSGlobalScopeCloud {
  baseUrl?: string;
  apiOrigin?: string;
  routerBaseUrl?: string;
  iid?: string;
}
