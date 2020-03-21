<script>
  export { className as class };
  export let value;
  export let text;
  export let selected = false;

  let className = '';
</script>

<style lang="scss">

</style>

<option class="select-item {className}" {value} {selected}>
  {#if text}
    {text}
  {:else}
    <slot />
  {/if}
</option>
