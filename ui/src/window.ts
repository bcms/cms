import { Sdk } from '@thebcms/selfhosted-sdk';
import type { HeadMetaService } from '@bcms/selfhosted-ui/services/head-meta';
import type { NotificationService } from '@bcms/selfhosted-ui/services/notification';
import type { TooltipService } from '@bcms/selfhosted-ui/services/tooltip';
import type { Throwable } from '@bcms/selfhosted-ui/util/throwable';
import type { ModalService } from '@bcms/selfhosted-ui/services/modal';
import type { UseLanguage } from '@bcms/selfhosted-ui/hooks/language';
import type { ConfirmService } from '@bcms/selfhosted-ui/services/confirm';
import type { PropValidator } from '@bcms/selfhosted-ui/util/prop-validation';
import type {
    PageTransition
} from "@bcms/selfhosted-ui/services/page-transition";
import type {UseTheme} from "@bcms/selfhosted-ui/hooks/theme";
import type {UseScreenSize} from "@bcms/selfhosted-ui/hooks/screen";

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
    useTheme: UseTheme;
    useScreenSize: UseScreenSize;
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
