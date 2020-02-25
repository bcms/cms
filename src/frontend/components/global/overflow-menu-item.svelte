<script>
  import Button from './button.svelte';

  export let text = '';
  export let danger = false;
  export { className as class };

  let className;
</script>

<style type="text/scss">

</style>

<Button
  {className}
  size="small"
  kind={danger === true ? 'danger' : 'ghost'}
  on:click>
  {text}
</Button>
