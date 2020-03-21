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
  .btn {
    padding: 10px 30px 10px 15px;
    border: 2px solid #0000;
    font-size: 10pt;
  }

  .btn:focus {
    border: 2px solid var(--c-primary);
  }

  .btn-primary {
    color: var(--c-white);
    background-color: var(--c-primary);
  }

  .btn-primary:hover {
    background-color: var(--c-primary-hover);
    cursor: pointer;
  }

  .btn-ghost {
    color: var(--c-primary);
    background-color: #0000;
  }

  .btn-ghost:hover {
    background-color: var(--c-gray-lighter);
    cursor: pointer;
  }

  .btn-danger {
    color: var(--c-white);
    background-color: var(--c-error);
  }

  .btn-danger:hover {
    background-color: var(--c-error-hover);
    cursor: pointer;
  }

  .btn-danger:focus {
    border: 2px solid var(--c-error);
  }
</style>

<button
  class="{className} btn btn-{kind} btn-{size}"
  {style}
  {disabled}
  on:click>
  {#if icon}
    <span class="{icon} icon {onlyIcon === false ? 'mr-20' : ''}" />
  {/if}
  <slot />
</button>
