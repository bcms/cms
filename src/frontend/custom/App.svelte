<script>
  import FontAwesome from '../components/global/font-awesome.svelte';
  import { Layout, SimplePopup } from '../components';
  import Custom from '@custom_path';
  import {
    Store,
    axios,
    entryStore,
    fatch,
    forceFatch,
    fileStore,
    functionStore,
    groupStore,
    keyStore,
    languageStore,
    pathStore,
    templateStore,
    userStore,
    webhookStore,
    widgetStore,
  } from '../config.svelte';
</script>

<style type="text/scss" global>
  @import '../styles/global.scss';
</style>

<FontAwesome />
<Layout useNormalLink={true}>
  <Custom @props />
</Layout>
<SimplePopup />
