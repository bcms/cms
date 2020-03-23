import App from './App.temp.svelte';

const app = new App({
  target: document.body,
  props: {
    config: '@config',
  }
});

export default app;
