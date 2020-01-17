<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Create New Webhook',
  };
  let data = {
    name: {
      value: '',
      error: '',
    },
    desc: '',
    body: '{}',
  };

  events.cancel = () => {
    data = {
      name: {
        value: '',
        error: '',
      },
      desc: '',
      body: '{}',
    };
    events.toggle();
  };
  events.done = () => {
    if (data.name.value.replace(/ /g, '') === '') {
      data.name.error = 'Input cannot be empty.';
      return;
    }
    data.name.error = '';
    events.toggle();
    events.callback({
      name: data.name.value,
      desc: data.desc,
      body: btoa(data.body),
    });
    data = {
      name: {
        value: '',
        error: '',
      },
      desc: '',
      body: '{}',
    };
  };
</script>

<style type="text/scss">
  @import './add-webhook.scss';
</style>

<Modal heading={modalHeading} {events}>
  <div class="content">
    <div class="title">Settings</div>
    <div class="options">
      <div class="key-value">
        <div class="label">
          Name
          {#if data.name.error !== ''}
            <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.name.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input
            class="input"
            bind:value={data.name.value}
            placeholder="- Webhook Name -" />
        </div>
      </div>
      <div class="key-value">
        <div class="label">Description</div>
        <div class="value">
          <textarea
            class="input"
            bind:value={data.desc}
            placeholder="- Webhook description -" />
        </div>
      </div>
    </div>
  </div>
</Modal>
