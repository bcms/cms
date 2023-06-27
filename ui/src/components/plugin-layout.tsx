import { defineComponent, onMounted, onUnmounted } from 'vue';

const component = defineComponent({
  setup(_, ctx) {
    const storageUnsub = window.bcms.sdk.storage.subscribe<string>(
      'theme',
      (val) => {
        if (val === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    );

    onMounted(() => {
      const theme = window.bcms.sdk.storage.get('theme');
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    });

    onUnmounted(() => {
      storageUnsub();
    });

    return () => <div>{ctx.slots.default ? ctx.slots.default() : <></>}</div>;
  },
});

export default component;
