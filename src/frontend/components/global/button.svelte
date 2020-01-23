<script>
  import { Button } from 'carbon-components-svelte';

  export { className as class };
  export let icon;
  export let onlyIcon = false;
  export let kind = 'primary';
  export let size;

  let className;
</script>

<style type="text/scss">
  @import './button.scss';
</style>

<Button class={className} {kind} {size} on:click>
  {#if icon}
    <span class="{icon} icon" />
    {#if onlyIcon === false}&nbsp;{/if}
  {/if}
  {#if onlyIcon === false}
    <slot>
      <button />
    </slot>
  {/if}
</Button>
