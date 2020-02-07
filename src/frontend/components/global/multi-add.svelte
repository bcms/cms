<script>
  import uuid from 'uuid';
  import { onMount } from 'svelte';
  import { TextInput } from 'carbon-components-svelte';
  import Button from './button.svelte';

  export { className as class };
  export let options;
  export let label;

  const id = uuid.v4();
  let list = [];
  let value = '';
  let error = '';
  let className;

  function removeItem(id) {
    list = list.filter(item => item.id !== id);
  }
  function handleInput(event) {
    const v = event.currentTarget.value
      .toUpperCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9A-Z_-_]+/g, '');
    value = v;
    event.currentTarget.value = v;
    if (event.key === 'Enter') {
      const i = list.find(item => item.value === value);
      if (i) {
        error = `Item '${value}' already exist. Values must be unique.`;
        return;
      }
      error = '';
      list = [
        ...list,
        {
          id: uuid.v4(),
          value: value,
        },
      ];
      value = '';
      event.currentTarget.value = '';
    }
  }

  if (options.init) {
    list = options.init().map(e => {
      return {
        id: uuid.v4(),
        value: e,
      };
    });
  }
  options.getList = () => {
    return list.map(item => {
      return item.value;
    });
  };
  options.clear = () => {
    list = [];
    value = '';
    error = '';
  };

  onMount(() => {
    document.getElementById(id).addEventListener('keyup', handleInput);
  });
</script>

<style>
  .list {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-gap: 10px;
  }
</style>

<div class="multi-add {className}">
  {#if error !== ''}
    <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
      <span class="fa fa-exclamation" />
      <span style="margin-left: 5px;">{error}</span>
    </div>
  {/if}
  <div class="in">
    <TextInput
      {id}
      labelText={label}
      helperText="Type some string and press Enter key." />
  </div>
  <div class="list">
    {#each list as item}
      <div>
        <Button
          kind="ghost"
          size="small"
          icon="fas fa-times"
          on:click={event => {
            removeItem(item.id);
          }}>
          {item.value}
        </Button>
      </div>
    {/each}
  </div>
</div>
