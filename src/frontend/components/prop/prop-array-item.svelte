<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../global/button.svelte';

  export let prop;
  export let position;

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  @import './prop.scss';

  .h {
    display: flex;
  }

  .h .n {
    margin: auto 0;
  }

  .h .a {
    margin-left: auto;
  }
</style>

<div class="array-item">
  <div>
    <div class="h">
      <div class="n">Item {position + 1}</div>
      <div class="a">
        <Button
          icon="fas fa-chevron-up"
          onlyIcon={true}
          kind="ghost"
          size="small"
          on:click={() => {
            dispatch('move', { prop, from: position, to: position - 1 });
          }} />
        <Button
          icon="fas fa-chevron-down"
          onlyIcon={true}
          kind="ghost"
          size="small"
          on:click={() => {
            dispatch('move', { prop, from: position, to: position + 1 });
          }} />
        <Button
          icon="fas fa-trash"
          kind="ghost"
          size="small"
          on:click={() => {
            dispatch('remove', { prop, position });
          }}>
          Remove
        </Button>
      </div>
    </div>
  </div>
  <slot />
</div>
