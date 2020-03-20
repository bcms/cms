<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../global/button.svelte';

  export let prop;

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import './prop.scss';
</style>

<div class="array">
  <slot />
  <div class="action">
    <Button
      icon="fas fa-plus"
      size="small"
      kind="ghost"
      on:click={() => {
        dispatch('add', prop);
      }}>
      Add Item
    </Button>
  </div>
</div>
