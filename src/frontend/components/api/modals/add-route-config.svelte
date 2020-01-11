<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: 'Add Key Configuration',
  };

  function select(type) {
    events.callback(type);
    events.toggle();
  }

  events.cancel = () => {
    events.toggle();
  };
  events.done = () => {
    events.toggle();
  };
</script>

<style type="text/scss">
  @import './add-route-config.scss';
</style>

<Modal heading={modalHeading} {events}>
  <div class="content">
    <button
      class="template"
      on:click={() => {
        select('Template');
      }}>
      <div class="fas fa-cubes icon" />
      <div class="text">Template Configuration</div>
    </button>
    <button
      class="function"
      on:click={() => {
        select('Function');
      }}>
      <div class="fas fa-code icon" />
      <div class="text">Function Configuration</div>
    </button>
  </div>
</Modal>
