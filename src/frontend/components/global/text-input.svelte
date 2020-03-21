<script>
  import { createEventDispatcher } from 'svelte';

  export { className as class };
  export let id;
  export let value = '';
  export let placeholder = '';
  export let labelText;
  export let helperText;
  export let invalidText;
  export let disabled = false;

  const dispatch = createEventDispatcher();
  let className = '';
</script>

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
  <input
    {id}
    {disabled}
    {placeholder}
    value={`${value}`}
    on:keyup={event => {
      dispatch('input', event.target.value);
    }} />
</div>
