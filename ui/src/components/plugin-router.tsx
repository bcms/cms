import { computed, defineComponent, type PropType } from 'vue';
import type { RouteLocationNormalizedLoaded } from 'vue-router';
import { useTranslation } from '../translations';
import type { BCMSPluginRouterItem } from '../types';

const component = defineComponent({
  props: {
    route: {
      type: Object as PropType<RouteLocationNormalizedLoaded>,
      required: true,
    },
    routes: {
      type: Array as PropType<BCMSPluginRouterItem[]>,
      required: true,
    },
  },
  setup(props) {
    const translations = computed(() => {
      return useTranslation();
    });
    const onRoute = computed(() => {
      const hash = props.route.hash.replace('#', '');
      return props.routes.find((e) => e.path === hash);
    });

    return () => (
      <div>
        {onRoute.value ? (
          <onRoute.value.component />
        ) : (
          <div>{translations.value.page.plugin.noRoute}</div>
        )}
      </div>
    );
  },
});
export default component;
