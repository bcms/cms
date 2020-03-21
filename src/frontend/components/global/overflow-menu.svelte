<script>
  import { onMount } from 'svelte';
  import Button from './button.svelte';

  export let position = 'left';

  let show = false;

  onMount(() => {
    document.body.addEventListener('click', () => {
      if (show === true) {
        show = false;
      }
    });
  });
</script>

<style type="text/scss">
  .overflow-menu {
    position: relative;
  }

  .options {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    background-color: var(--c-white);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    overflow: hidden;
    z-index: 1000;
    width: 200px;
  }
</style>

<div class="overflow-menu">
  <Button
    class="main-btn"
    kind="ghost"
    icon="fas fa-ellipsis-v"
    onlyIcon={true}
    on:click={() => {
      if (show === false) {
        setTimeout(() => {
          show = true;
        }, 50);
      }
    }} />
  {#if show === true}
    <div
      class="options"
      style={position === 'right' ? 'right: 60px;' : 'left: 0;'}>
      <slot />
    </div>
  {/if}
</div>
