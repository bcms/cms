import { computed, defineComponent } from 'vue';
import { useMedia } from '@thebcms/selfhosted-ui/hooks/media';
import { Icon } from '@thebcms/selfhosted-ui/components/icon';
import type { Media } from '@thebcms/selfhosted-backend/media/models/main';

export const Breadcrumb = defineComponent({
    emits: {
        click: (_mediaId?: Media) => true,
    },
    setup(_, ctx) {
        const sdk = window.bcms.sdk;
        const { mediaActiveParent } = useMedia();
        const mediaTree = computed(() => {
            if (!mediaActiveParent.value) {
                return [];
            }
            return sdk.media.resolveTree(
                mediaActiveParent.value,
                sdk.store.media.items(),
            );
        });

        return () => (
            <nav class="flex">
                <ul class="list-none flex items-center flex-wrap">
                    <li class="flex items-center">
                        <button
                            onClick={() => {
                                ctx.emit('click');
                            }}
                            class="uppercase text-xs tracking-0.06 leading-normal flex no-underline text-dark transition-colors duration-200 hover:text-opacity-60 focus-visible:text-opacity-60 dark:text-light"
                        >
                            <span>Media manager</span>
                        </button>
                    </li>
                    {mediaTree.value.map((item) => {
                        return (
                            <li class="flex items-center">
                                <Icon
                                    src="/chevron/right"
                                    class="text-dark fill-current w-2.5 mx-2.5 dark:text-light"
                                />
                                <button
                                    onClick={() => {
                                        ctx.emit('click', item);
                                    }}
                                    class="uppercase text-xs tracking-0.06 leading-normal flex no-underline text-dark transition-colors duration-200 hover:text-opacity-60 focus-visible:text-opacity-60 dark:text-light"
                                >
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    },
});
