<script>
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import Button from '../../global/button.svelte';

  export let events;

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

<Modal heading={{ title: 'Add Key Configuration' }} {events}>
  <Button
    class="w-100p"
    icon="fas fa-cubes"
    kind="ghost"
    on:click={() => {
      select('Template');
    }}>
    Template Configuration
  </Button>
  <Button
    class="w-100p"
    icon="fas fa-code"
    kind="ghost"
    on:click={() => {
      select('Function');
    }}>
    Function Configuration
  </Button>
</Modal>
