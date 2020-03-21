<script>
  import { createEventDispatcher } from 'svelte';

  export { className as class };
  export let style = '';
  export let value = '';
  export let placeholder = '';
  export let labelText;
  export let helperText;
  export let invalidText;
  export let invalid;
  export let cols;
  export let rows;
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
  {#if invalid && invalid === true}
    <div class="invalid-text">
      <span class="fas fa-exclamation icon" />
      {invalidText}
    </div>
  {/if}
  <textarea
    {style}
    {disabled}
    {placeholder}
    {cols}
    {rows}
    value={`${value}`}
    on:keyup={event => {
      dispatch('input', event.target.value);
    }} />
</div>
