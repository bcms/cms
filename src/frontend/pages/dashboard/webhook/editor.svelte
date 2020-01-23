<script>
  import { onMount } from 'svelte';
  import { TextArea } from 'carbon-components-svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import { sideBarOptions } from '../../../components/layout/side-bar.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import ManagerLayout from '../../../components/layout/manager-content.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
  import AddWebhookModal from '../../../components/webhook/modals/add-webhook.svelte';
  import EditWebhookModal from '../../../components/webhook/modals/edit-webhook.svelte';
  import StringUtil from '../../../string-util.js';

  export let axios;
  export let Store;

  let groups = [];
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
  let editWebhookModalEvents = { callback: updateWebhook };
  let invalidJSONObject = false;

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
    sideBarOptions.updateWebhooks(webhooks);
  }
  async function updateWebhook(data) {
    console.log('WOHO');
    let d;
    if (data) {
      d = data;
    } else {
      d = webhookSelected;
      try {
        JSON.parse(atob(d.body));
      } catch (error) {
        invalidJSONObject = true;
        return;
      }
      invalidJSONObject = false;
    }
    // const result = await axios.send({
    //   url: '/webhook',
    //   method: 'PUT',
    //   data: d,
    // });
    // if (result.success === false) {
    //   simplePopup.error(result.error.response.data.message);
    //   return;
    // }
    // webhooks = webhooks.map(e => {
    //   if (e._id === d._id) {
    //     return result.response.data.webhook;
    //   }
    //   return e;
    // });
    // webhookSelected = result.response.data.webhook;
    // menu.config.itemSelected = webhookSelected;
    // menu.config.items = webhooks;
    // sideBarOptions.updateWebhooks(webhooks);
    // simplePopup.success('Webhook updated successfully!');
  }
  async function deleteWebhook() {
    if (confirm('Are you sure you want to delete this webhook?')) {
      const result = await axios.send({
        url: `/webhook/${webhookSelected._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      webhooks = webhooks.filter(e => e._id !== webhookSelected._id);
      if (webhooks.length === 0) {
        webhookSelected = undefined;
      } else {
        webhookSelected = webhooks[0];
      }
      menu.config.itemSelected = webhookSelected;
      menu.config.items = webhooks;
      sideBarOptions.updateWebhooks(webhooks);
    }
  }

  onMount(async () => {
    let result = await axios.send({
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
  <!-- <div class="editor">
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
        <button
          class="btn-border btn-red-c btn-red-br delete"
          on:click={deleteWebhook}>
          <div class="fa fa-trash icon" />
          <div class="text">Delete</div>
        </button>
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
  </div> -->
  <ManagerLayout
    items={webhooks}
    itemSelected={webhookSelected}
    onlySlot={true}
    menuConfig={{ heading: 'GROUPS', buttonLabel: 'Add new Group' }}
    on:addNewItem={event => {
      if (event.eventPhase === 0) {
        addWebhookModalEvents.toggle();
      }
    }}
    on:itemClicked={event => {
      if (event.eventPhase === 0) {
        webhookSelected = event.detail;
        menu.config.itemSelected = event.detail;
      }
    }}
    on:delete={event => {
      if (event.eventPhase === 0) {
        deleteWebhook();
      }
    }}>
    <div class="update">
      <Button
        icon="fas fa-check"
        size="small"
        on:click={event => {
          updateWebhook();
        }}>
        Update
      </Button>
    </div>
    <TextArea
      invalid={invalidJSONObject}
      invalidText={'Valid JSON Object must be provided.'}
      labelText={'Webhook body'}
      helperText={'Valid JSON object string is required.'}
      cols="500"
      value={atob(webhookSelected.body)}
      on:input={event => {
        webhookSelected.body = btoa(event.target.value);
      }} />
  </ManagerLayout>
</Layout>
<AddWebhookModal events={addWebhookModalEvents} />
{#if webhookSelected}
  <EditWebhookModal events={editWebhookModalEvents} webhook={webhookSelected} />
{/if}
