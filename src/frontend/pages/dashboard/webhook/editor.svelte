<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import Menu from '../../../components/menu.svelte';
  import AddWebhookModal from '../../../components/widget/modals/add-widget.svelte';

  export let axios;
  export let Store;

  let webhooks = [];
  let webhookSelected;
  let menu = {
    config: {
      heading: 'WEBHOOKS',
      buttonLabel: 'Add New Webhook',
      items: webhooks,
      itemSelected: webhookSelected,
    },
    events: {
      clicked: item => {
        webhookSelected = item;
        menu.config.itemSelected = item;
      },
      addNewItem: () => {
        addWebhookModalEvents.toggle();
      },
    },
  };
  let addWehbookModalEvents = { callback: addWebhook };

  async function addWebhook(data) {}
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <div class="editor">
    <Menu events={menu.events} config={menu.config} />
  </div>
</Layout>
<AddWebhookModal events={addWehbookModalEvents} />
