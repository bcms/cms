<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import Menu from '../../../components/menu.svelte';
  import AddWebhookModal from '../../../components/webhook/modals/add-webhook.svelte';
  import StringUtil from '../../../string-util.js';

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
  let addWebhookModalEvents = { callback: addWebhook };
  let editWebhookModalEvents = { callbask: updateWebhook };

  async function addWebhook(data) {
    const result = await axios.send({
      url: '/webhook',
      method: 'POST',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    webhooks = [...webhooks, result.response.data.webhook];
    webhookSelected = result.response.data.webhook;
    menu.config.itemSelected = webhookSelected;
    menu.config.items = webhooks;
  }
  async function updateWebhook(data) {
    let d;
    if (data) {
      d = data;
    } else {
      d = webhookSelected;
      try {
        JSON.parse(document.getElementById(d._id).value);
      } catch (error) {
        simplePopup.error('Invalid JSON format.');
        document.getElementById(d._id).style.borderColor = 'red';
        return;
      }
      d.body = btoa(document.getElementById(d._id).value);
    }
    const result = await axios.send({
      url: '/webhook',
      method: 'PUT',
      data: d,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    webhooks = webhooks.map(e => {
      if (e._id === d._id) {
        return result.response.data.webhook;
      }
      return e;
    });
    webhookSelected = result.response.data.webhook;
    menu.config.itemSelected = webhookSelected;
    menu.config.items = webhooks;
    simplePopup.success('Webhook updated successfully!');
  }

  onMount(async () => {
    const result = await axios.send({
      url: `/webhook/all`,
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    webhooks = result.response.data.webhooks;
    if (webhooks.length > 0) {
      webhookSelected = webhooks[0];
    }
    menu.config.items = webhooks;
    menu.config.itemSelected = webhookSelected;
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <div class="editor">
    <Menu events={menu.events} config={menu.config} />
    <div class="content">
      {#if webhookSelected}
        <div class="heading">
          <div class="title">{StringUtil.prettyName(webhookSelected.name)}</div>
          <button
            class="btn edit"
            on:click={() => {
              editWebhookModalEvents.toggle();
            }}>
            <div class="fa fa-edit icon" />
          </button>
        </div>
        <div class="desc">
          {#if webhookSelected.desc === ''}
            This Webhook does not have description.
          {:else}{webhookSelected.desc}{/if}
        </div>
        <div class="update">
          <button
            class="btn-border btn-blue-c btn-blue-br"
            on:click={() => {
              updateWebhook();
            }}>
            <div class="fas fa-trash icon" />
            <div class="text">Update</div>
          </button>
        </div>
        <div class="basic-info">
          <div class="key-value">
            <div class="label">ID</div>
            <div class="value">{webhookSelected._id}</div>
          </div>
          <div class="key-value">
            <div class="label">Created At</div>
            <div class="value">
              {new Date(webhookSelected.createdAt).toLocaleString()}
            </div>
          </div>
          <div class="key-value">
            <div class="label">Updated At</div>
            <div class="value">
              {new Date(webhookSelected.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div class="props">
          <div class="key-value">
            <div class="label">Webhhok body</div>
            <div class="value">
              <textarea
                id={webhookSelected._id}
                class="textarea"
                value={atob(webhookSelected.body)}
                rows="10" />
            </div>
          </div>
        </div>
      {:else}
        <div class="props">
          <div class="no-props">
            <div class="message">No Webhooks in Database yet</div>
            <div class="desc">Add your first Webhook</div>
            <button
              class="btn-fill btn-blue-bg action"
              on:click={addWebhookModalEvents.toggle}>
              <div class="fa fa-plus icon" />
              <div class="text">Add new Webhook</div>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</Layout>
<AddWebhookModal events={addWebhookModalEvents} />
