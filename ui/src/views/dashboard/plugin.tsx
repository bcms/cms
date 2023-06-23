import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import { BCMSSpinner } from '../../components';

const component = defineComponent({
  setup() {
    const route = useRoute();
    const showSpinner = ref(false);
    const pluginName = computed(() => route.params.pluginName as string);

    window.bcms.meta.set({
      title: (route.params.pluginName as string)
        .split('-')
        .map(
          (part) =>
            part.charAt(0).toUpperCase() + part.substring(1).toLowerCase()
        )
        .join(' '),
    });

    return () => (
      <>
        <iframe
          src={`/plugin/${pluginName.value}/_index.html?v=${Date.now()}`}
          class="absolute top-0 left-0 w-full h-screen p-0"
        />
        <BCMSSpinner show={showSpinner.value} />
      </>
    );
  },
});
export default component;
