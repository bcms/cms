<script>
  import { createEventDispatcher } from 'svelte';

  export { className as class };
  export let value = '';
  export let placeholder = '';
  export let labelText;
  export let helperText;
  export let invalidText;
  export let disabled = false;

  const dispatch = createEventDispatcher();
  let className = '';
  let show = false;
</script>

<style lang="scss">
  .password-wrapper {
    display: grid;
    grid-template-columns: auto 40px;
    width: 100%;
  }

  .password-wrapper button {
    border: none;
    color: var(--c-gray);
    background-color: #0000;
  }
</style>

<div class="{className} input-wrapper">
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
  <div class="password-wrapper">
    <input
      type={show === true ? 'text' : 'password'}
      {disabled}
      {placeholder}
      value={`${value}`}
      on:keyup={event => {
        dispatch('input', event.target.value);
      }} />
    <button
      style="padding: auto 10px;"
      on:click={() => {
        show = !show;
      }}>
      <div class="fas fa-{show === true ? 'eye' : 'eye-slash'}" />
    </button>
  </div>
</div>
