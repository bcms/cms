<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '../global/button.svelte';
  import OverflowMenu from '../global/overflow-menu.svelte';
  import OverflowMenuItem from '../global/overflow-menu-item.svelte';

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
        <OverflowMenu position="right">
          <OverflowMenuItem
            text="Move Up"
            on:click={() => {
              dispatch('move', { prop, from: position, to: position - 1 });
            }} />
          <OverflowMenuItem
            text="Move Down"
            on:click={() => {
              dispatch('move', { prop, from: position, to: position + 1 });
            }} />
          <OverflowMenuItem
            text="Remove"
            danger={true}
            on:click={() => {
              dispatch('remove', { prop, position });
            }} />
        </OverflowMenu>
      </div>
    </div>
  </div>
  <slot />
</div>
