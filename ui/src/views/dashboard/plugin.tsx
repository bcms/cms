import { defineComponent, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Loader } from '@thebcms/selfhosted-ui/components/loader';

export const PluginView = defineComponent({
    setup() {
        const sdk = window.bcms.sdk;
        const throwable = window.bcms.throwable;
        const meta = window.bcms.meta;
        const route = useRoute();

        const plugin = ref<{ name: string; id: string }>();
        const loading = ref(true);

        onMounted(async () => {
            loading.value = true;
            await throwable(
                async () => {
                    return sdk.plugin.getAll();
                },
                async (result) => {
                    const found = result.list.find(
                        (e) => e.id === route.params.pluginId,
                    );
                    if (found) {
                        plugin.value = found;
                        meta.set({ title: found.name + ' | Plugin' });
                    }
                    loading.value = false;
                },
            );
        });

        return () => (
            <div class={`flex flex-col w-full h-full`}>
                {loading.value || !plugin.value ? (
                    <Loader class={`m-auto`} show />
                ) : (
                    <iframe
                        class={`absolute top-0 left-0 max-desktop:pl-6 pl-[312px] w-full h-full`}
                        src={`/__plugin/${plugin.value.id}`}
                    />
                )}
            </div>
        );
    },
});

export default PluginView;
