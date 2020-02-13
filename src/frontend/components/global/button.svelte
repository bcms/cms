<script>
  import { Button } from 'carbon-components-svelte';

  export { className as class };
  export let icon;
  export let onlyIcon = false;
  export let kind = 'primary';
  export let size;
  export let style;
  export let disabled = false;

  let className;
</script>

<style type="text/scss">
  .button {
    margin-left: 0;
  }
</style>

<Button {disabled} class={className} {kind} {size} {style} on:click>
  {#if icon}
    <span class="{icon} icon {onlyIcon === false ? 'mr-20' : ''}" />
  {/if}
  {#if onlyIcon === false}
    <div class="button">
      <slot>
        <button />
      </slot>
    </div>
  {/if}
</Button>
