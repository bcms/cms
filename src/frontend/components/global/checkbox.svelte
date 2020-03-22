<script>
  export { className as class };
  export let labelText;
  export let checked = false;

  let className = '';
</script>

<style lang="scss">
  .checkbox-wrapper {
    display: flex;
    padding: 3px 0;
  }

  .checkbox-wrapper .text {
    font-size: 12pt;
    margin-left: 10px;
  }
</style>

<div class="{className} checkbox-wrapper">
  <input
    type="checkbox"
    {checked}
    on:change />
  {#if labelText}
    <div class="text">{labelText}</div>
  {/if}
</div>
