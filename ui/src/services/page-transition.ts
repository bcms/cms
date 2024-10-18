import { v4 as uuidv4 } from 'uuid';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { onBeforeUnmount, ref, type Ref } from 'vue';

export type PageTransitionState =
    | 'in'
    | 'out'
    | 'in-done'
    | 'out-done'
    | 'wait';

export interface PageTransitionHandler {
    (state: PageTransitionState): Promise<void>;
}

export interface PageTransitionSub {
    id: string;
    group: string;
    state: Ref<PageTransitionState>;
    handler: PageTransitionHandler;
}

export class PageTransition {
    private subs: PageTransitionSub[] = [];
    private inTimeout: NodeJS.Timeout | undefined = undefined;
    private onDone: (() => void) | null = null;
    private firstRouteRun = true;

    constructor(
        private route: RouteLocationNormalizedLoaded,
        private router: Router,
    ) {
        this.router.beforeEach(async (to, from, next) => {
            if (this.firstRouteRun) {
                this.firstRouteRun = false;
                next();
                return;
            }
            if (to.meta.layout !== from.meta.layout) {
                await this.triggerOut();
                // await new Promise<void>((resolve) => {
                //     this.onDone = resolve;
                // });
            }
            next();
        });
    }

    async triggerOut(group?: string) {
        for (let i = this.subs.length - 1; i > -1; i--) {
            if (!group || this.subs[i].group === group) {
                this.subs[i].state.value = 'out';
                try {
                    await this.subs[i].handler('out');
                } catch (err) {
                    console.error(err);
                }
                this.subs[i].state.value = 'out-done';
                this.subs.splice(i, 1);
            }
        }
        if (this.onDone) {
            this.onDone();
            this.onDone = null;
        }
    }

    // async triggerIn() {
    //     for (let i = 0; i < this.subs.length; i++) {
    //         if (this.subs[i].group === this.route.fullPath) {
    //             try {
    //                 this.subs[i].state.value = 'in';
    //                 await this.subs[i].handler('in');
    //             } catch (err) {
    //                 console.error(err);
    //             }
    //         }
    //     }
    // }

    register(
        handler: PageTransitionHandler,
    ): [state: Ref<PageTransitionState>, () => void] {
        const id = uuidv4();
        const group = (this.route.meta.layout as string) || '';
        const state = ref<PageTransitionState>('wait');
        this.subs.push({
            id,
            group,
            state,
            handler,
        });
        clearTimeout(this.inTimeout);
        this.inTimeout = setTimeout(async () => {
            for (let i = 0; i < this.subs.length; i++) {
                if (this.subs[i].group === this.route.meta.layout) {
                    this.subs[i].state.value = 'in';
                    try {
                        await this.subs[i].handler('in');
                    } catch (err) {
                        console.error(err);
                    }
                    this.subs[i].state.value = 'in-done';
                }
            }
        }, 10);
        onBeforeUnmount(() => {
            for (let i = 0; i < this.subs.length; i++) {
                if (this.subs[i].id === id) {
                    this.subs.splice(i, 1);
                    break;
                }
            }
        });
        return [
            state,
            () => {
                for (let i = 0; i < this.subs.length; i++) {
                    if (this.subs[i].id === id) {
                        this.subs.splice(i, 1);
                        break;
                    }
                }
            },
        ];
    }
}

let pageTransition: PageTransition | null = null;

export function initializePageTransition(
    route: RouteLocationNormalizedLoaded,
    router: Router,
) {
    pageTransition = new PageTransition(route, router);
}

export function usePageTransition() {
    if (!pageTransition) {
        throw Error(
            'Page transition handler was not initialized. Please' +
                ' call "initializePageTransition(route, router)" after Vue app' +
                ' creation.',
        );
    }
    return pageTransition;
}
