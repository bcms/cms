<script>
  import { onMount } from 'svelte';
  import {
    axios,
    fatch,
    groupStore,
    webhookStore,
  } from '../../../config.svelte';
  import TextArea from '../../../components/global/text-area.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
  import WebhookModal from '../../../components/global/modal/name-desc.svelte';
  import StringUtil from '../../../string-util.js';
  import Base64 from '../../../base64.js';

  let groups = [];
  let webhooks = [];
  let webhookSelected;
  let addWebhookModalEvents = {};
  let editWebhookModalEvents = {};
  let invalidJSONObject = false;

  groupStore.subscribe(value => {
    groups = value;
  });
  webhookStore.subscribe(value => {
    webhooks = value;
    if (webhooks.length > 0) {
      webhookSelected = webhooks[0];
    }
  });

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
    webhookStore.update(value => [...webhooks, result.response.data.webhook]);
    webhookSelected = result.response.data.webhook;
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
    const result = await axios.send({
      url: '/webhook',
      method: 'PUT',
      data: d,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    webhookSelected = result.response.data.webhook;
    webhookStore.update(value =>
      webhooks.map(e => {
        if (e._id === webhookSelected._id) {
          return webhookSelected;
        }
        return e;
      }),
    );
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
      webhookStore.update(value =>
        webhooks.filter(e => e._id !== webhookSelected._id),
      );
      if (webhooks.length === 0) {
        webhookSelected = undefined;
      } else {
        webhookSelected = webhooks[0];
      }
    }
  }

  onMount(async () => {
    fatch();
    if (webhooks.length > 0) {
      webhookSelected = webhooks[0];
    }
  });
</script>

<style type="text/scss">
  .update {
    margin-left: auto;
  }
</style>

<Layout>
  <ManagerLayout
    items={webhooks}
    itemSelected={webhookSelected}
    onlySlot={true}
    menuConfig={{ heading: 'WEBHOOKS', buttonLabel: 'Add new Webhook' }}
    on:edit={event => {
      editWebhookModalEvents.set(webhookSelected.name, webhookSelected.desc);
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
      style="font-family: monospace;"
      invalid={invalidJSONObject}
      invalidText={'Valid JSON Object must be provided.'}
      labelText={'Webhook body'}
      helperText={'Valid JSON object is required.'}
      cols="500"
      value={Base64.decode(webhookSelected.body)}
      on:input={event => {
        webhookSelected.body = Base64.encode(event.target.value);
      }} />
  </ManagerLayout>
</Layout>
<WebhookModal
  title="Add new Webhook"
  events={addWebhookModalEvents}
  on:done={event => {
    addWebhook({
      name: event.detail.name,
      desc: event.detail.desc,
      body: Base64.encode('{}'),
    });
  }} />
<WebhookModal
  title="Edit Webhook"
  events={editWebhookModalEvents}
  on:done={event => {
    webhookSelected.name = event.detail.name;
    webhookSelected.desc = event.detail.desc;
    updateWebhook();
  }} />
