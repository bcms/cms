<script>
  import { Button } from 'carbon-components-svelte';

  export { className as class };
  export let icon;
  export let onlyIcon = false;
  export let kind = 'primary';
  export let size;
  export let style;

  let className;
</script>

<Button class={className} {kind} {size} {style} on:click>
  {#if icon}
    <span class="{icon}" />
    {#if onlyIcon === false}&nbsp;{/if}
  {/if}
  {#if onlyIcon === false}
    <slot>
      <button />
    </slot>
  {/if}
</Button>
