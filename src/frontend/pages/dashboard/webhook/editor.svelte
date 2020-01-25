<script>
  import { onMount } from 'svelte';
  import { TextArea } from 'carbon-components-svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import { sideBarOptions } from '../../../components/global/side-bar.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
  import AddWebhookModal from '../../../components/global/modal/name-desc.svelte';
  import EditWebhookModal from '../../../components/global/modal/name-desc.svelte';
  import StringUtil from '../../../string-util.js';
  import Base64 from '../../../base64.js';

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
  let addWebhookModalEvents = {};
  let editWebhookModalEvents = {};
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
    let d;
    if (data) {
      d = data;
    } else {
      d = webhookSelected;
      try {
        JSON.parse(Base64.decode(d.body));
      } catch (error) {
        invalidJSONObject = true;
        return;
      }
      invalidJSONObject = false;
    }
    console.log(d);
    const result = await axios.send({
      url: '/webhook',
      method: 'PUT',
      data: d,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    webhooks = [...webhooks, result.response.data.webhook];
    webhookSelected = result.response.data.webhook;
    simplePopup.success('Webhook updated successfully.');
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

<Layout {Store} {axios}>
  <ManagerLayout
    items={webhooks}
    itemSelected={webhookSelected}
    onlySlot={true}
    menuConfig={{ heading: 'WEBHOOKS', buttonLabel: 'Add new Webhook' }}
    on:edit={event => {
      editWebhookModalEvents.toggle();
    }}
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
      value={Base64.decode(webhookSelected.body)}
      on:input={event => {
        webhookSelected.body = Base64.encode(event.target.value);
      }} />
  </ManagerLayout>
</Layout>
<AddWebhookModal
  title="Add Webhook"
  events={addWebhookModalEvents}
  on:done={event => {
    addWebhook({
      name: event.detail.name,
      desc: event.detail.desc,
      body: Base64.encode('{}'),
    });
  }} />
{#if webhookSelected}
  <EditWebhookModal
    title="Edit Webhook"
    events={editWebhookModalEvents}
    name={webhookSelected.name}
    desc={webhookSelected.desc}
    on:done={event => {
      webhookSelected.name = event.detail.name;
      webhookSelected.desc = event.detail.desc;
      updateWebhook();
    }} />
  <!-- <EditWebhookModal events={editWebhookModalEvents} webhook={webhookSelected} /> -->
{/if}
