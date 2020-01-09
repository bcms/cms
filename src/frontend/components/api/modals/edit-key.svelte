<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;
  export let key;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Edit API Key',
  };

  events.cancel = () => {
    events.toggle();
  };
  events.done = () => {
    if (key.name.replace(/ /g, '') === '') {
      simplePopup.error('Name cannot be empty.');
      return;
    }
    events.toggle();
    events.callback(key);
  };
</script>

<style type="text/scss">
  @import './edit-key.scss';
</style>

<Modal heading={modalHeading} {events}>
  <div class="content">
    <div class="title">Configuration</div>
    <div class="options">
      <div class="key-value">
        <div class="label">
          <span>Name</span>
        </div>
        <div class="value">
          <input
            class="input"
            placeholder="- Key Name -"
            bind:value={key.name} />
        </div>
      </div>
      <div class="key-value">
        <div class="label">
          <span>Description</span>
        </div>
        <div class="value">
          <textarea
            class="input"
            placeholder="- Key Description -"
            bind:value={key.desc} />
        </div>
      </div>
    </div>
  </div>
</Modal>
