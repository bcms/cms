<script>
  import { createEventDispatcher } from 'svelte';

  export { className as class };
  export let labelText;
  export let helperText;
  export let disabled = false;
  export let invalidText;

  let className = '';
  const dispatche = createEventDispatcher();
</script>

<style lang="scss">
  .select-wrapper {
    max-width: 200px;
  }

  .select-wrapper .select-box {
    display: flex;
  }

  .select-wrapper select {
    padding: 7px 30px 7px 9px;
    width: 100%;
    border: 2px solid #0000;
    border-bottom: 2px solid var(--c-gray);
    background-color: var(--c-gray-lighter);
    cursor: pointer;
  }

  .select-wrapper select:disabled {
    border-bottom: 2px solid var(--c-gray-lighter);
    cursor: default;
    color: var(--c-gray);
  }

  .select-wrapper select:focus {
    border: 2px solid var(--c-primary);
  }

  .select-wrapper .drop {
    width: 0px;
    position: relative;
    left: -25px;
    margin: auto 0;
  }
</style>

<div class="select-wrapper {className}">
  {#if labelText}
    <label class="label">{labelText}</label>
    {#if helperText}
      <div class="helper-text">{helperText}</div>
    {/if}
  {/if}
  {#if invalidText}
    <div class="invalid-text">
      <span class="fas fa-exclamation icon" />
      {invalidText}
    </div>
  {/if}
  <div class="select-box">
    <select
      {disabled}
      on:change={event => {
        dispatche('change', event.target.value);
      }}>
      <slot />
    </select>
    <div class="fas fa-chevron-down drop" />
  </div>
</div>
