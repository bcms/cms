<script>
  import { Button } from 'carbon-components-svelte';

  export { className as class };
  export let icon;
  export let onlyIcon = false;
  export let kind = 'primary';

  let className;
</script>

<style type="text/scss">
  @import './button.scss';
</style>

<Button class={className} {kind} on:click>
  {#if icon}
    <span class="{icon} icon" />
    {#if onlyIcon === false}&nbsp;{/if}
  {/if}
  <slot>
    <button />
  </slot>
</Button>
