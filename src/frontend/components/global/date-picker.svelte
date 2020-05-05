<script>
  import { createEventDispatcher } from 'svelte';

  export { className as class };
  export let value = Date.now();
  export let labelText;
  export let helperText;
  export let invalidText;

  const date = new Date(value);
  const dateString = `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  }-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`;
  const dispatch = createEventDispatcher();
  let className = '';
</script>

<style lang="scss">
  .date-picker {
    max-width: 200px;
  }
</style>

<div class="{className} input-wrapper date-picker">
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
    type="date"
    value={dateString}
    on:change={event => {
      dispatch('change', !event.target.valueAsNumber ? 0 : event.target.valueAsNumber);
    }} />
</div>
