<script context="module">
  export const config = {};
</script>

<script>
  import { onMount } from 'svelte';
  import { Store } from '../js/store.svelte';
  import { Axios } from '../js/axios.svelte';
  import Layout from '../components/layout/layout.svelte';

  // export let config

  onMount(() => {
    Store.init();
    const axios = Axios.instance();
    axios.config({
      baseURL: 'http://localhost:1280',
      preRequestFunction: Axios.jwtAutoRefreshPreRequestFunction(
        Store,
        'http://localhost:1280/auth/token/refresh',
        '/login',
      ),
    });

    config.axios = axios;
    config.Store = Store;
  });
</script>
