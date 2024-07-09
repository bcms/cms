import { Sdk } from '@thebcms/selfhosted-sdk';
import type { HeadMetaService } from '@thebcms/selfhosted-ui/services/head-meta';
import type { NotificationService } from '@thebcms/selfhosted-ui/services/notification';
import type { TooltipService } from '@thebcms/selfhosted-ui/services/tooltip';
import type { Throwable } from '@thebcms/selfhosted-ui/util/throwable';
import type { ModalService } from '@thebcms/selfhosted-ui/services/modal';
import type { UseLanguage } from '@thebcms/selfhosted-ui/hooks/language';
import type { ConfirmService } from '@thebcms/selfhosted-ui/services/confirm';
import type { PropValidator } from '@thebcms/selfhosted-ui/util/prop-validation';
import type {
    PageTransition
} from "@thebcms/selfhosted-ui/services/page-transition";

export interface GlobalScopeMain {
    // <
    //     CustomModals = unknown,
    //     CustomSocketEventsData = unknown
    // >
    origin: string;
    // confirm: BCMSConfirmService;
    meta: HeadMetaService;
    // markdown: BCMSMarkdownService;
    notification: NotificationService;
    tooltip: TooltipService;
    // modal: BCMSModalServiceExtended<CustomModals>;
    // prop: BCMSPropService;
    // entry: BCMSEntryService;
    // media: BCMSMediaService;
    // globalSearch: BCMSGlobalSearchService;
    useLanguage: UseLanguage;
    modalService: ModalService;
    throwable: Throwable;
    confirm: ConfirmService;
    entryPropValidator: PropValidator;
    pageTransition: () => PageTransition;
    // util: {
    //     date: BCMSDateUtility;
    //     object: BCMSObjectUtility;
    //     color: BCMSColorUtility;
    // };
    sdk: Sdk;
    // editor?: Ref<Editor | undefined>;
}

declare global {
    const bcms: GlobalScopeMain;
    interface Window {
        // Is declared in components/content/node-nav.vue
        editorNodeEnter(data: { element: HTMLElement }): void;
        editorNodeLeave(data: { element: HTMLElement }): void;

        // bcms: BCMSGlobalScopeMain<unknown, unknown>;
        bcms: GlobalScopeMain;
    }
}
