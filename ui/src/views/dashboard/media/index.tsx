import { computed, defineComponent, onBeforeUpdate, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { BCMSMediaViewer } from '../../../components';
import { useTranslation } from '../../../translations';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const route = useRoute();
    const store = window.bcms.vue.store;
    const media = computed(() => {
      return store.getters.media_items;
    });

    onMounted(() => {
      window.bcms.meta.set({ title: translations.value.page.media.meta.title });
    });
    onBeforeUpdate(() => {
      const target = media.value.find((e) => e._id === route.params.id);
      if (target) {
        window.bcms.meta.set({
          title: translations.value.page.media.meta.dynamicTitle({
            label: target.name,
          }),
        });
      } else {
        window.bcms.meta.set({
          title: translations.value.page.media.meta.title,
        });
      }
    });
    return () => (
      <div class="min-h-full py-7.5 desktop:pb-15 desktop:pt-0">
        <BCMSMediaViewer mode="view" />
      </div>
    );
  },
});
export default component;
