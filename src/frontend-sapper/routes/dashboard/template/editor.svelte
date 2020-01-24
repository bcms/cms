<script>
  import Config, { config } from '../../_config.svelte';
  import { onMount } from 'svelte';
  import Layout from '../../../components/layout/layout.svelte';

  // let config = {};
  let Store;
  let axios;

  onMount(() => {
    Store = config.Store;
    axios = config.axios;
    console.log(Store);
  });
</script>

{#if Store && axios}
  <Layout {Store} {axios}>text</Layout>
{/if}
<Config />
