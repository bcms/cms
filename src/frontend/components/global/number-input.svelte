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
</script>

<div class="{className} input-wrapper" style="max-width: 200px;">
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
    type="number"
    {disabled}
    {placeholder}
    value={`${value}`}
    on:change={event => {
      if (event.target.valueAsNumber !== NaN) {
        dispatch('change', event.target.valueAsNumber);
      } else {
        event.target.value = value;
      }
    }}
    on:keyup={event => {
      if (`${event.target.valueAsNumber}` !== 'NaN') {
        dispatch('change', event.target.valueAsNumber);
      } else {
        event.target.value = value;
      }
    }} />
</div>
