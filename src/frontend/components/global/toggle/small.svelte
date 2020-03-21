<script>
  import { createEventDispatcher } from 'svelte';
  export { className as class };
  export let toggled = false;
  export let labelText;
  export let helperText;
  export let labelA = 'Off';
  export let labelB = 'On';
  export let size = '20pt';

  const dispatch = createEventDispatcher();
  let className = '';
</script>

<style lang="scss">
  .toggle .wrapper {
    font-size: 10pt;
    display: flex;
  }

  .toggle .wrapper button {
    border: none;
    background-color: #0000;
    color: var(--c-gray);
  }

  .toggle .wrapper .on {
    color: var(--c-success);
  }

  .toggle .wrapper span {
    margin: auto 0 auto 10px;
  }
</style>

<div class="{className} toggle">
  {#if labelText}
    <label class="label">{labelText}</label>
    {#if helperText}
      <div class="helper-text">{helperText}</div>
    {/if}
  {/if}
  <div class="wrapper">
    <button
      style="font-size: {size}"
      class="fas fa-{toggled === true ? 'toggle-on on' : 'toggle-off'}"
      on:click={() => {
        dispatch('change', !toggled);
      }} />
    <span>{toggled === true ? labelB : labelA}</span>
  </div>
</div>
