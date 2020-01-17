<script>
  import uuid from 'uuid';

  export let options;

  let list = [];
  let value = '';
  let error = '';

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
</script>

<style>
  .list {
    display: flex;
    margin-top: 10px;
  }

  .list .item {
    margin-right: 10px;
  }
</style>

<div class="multi-add">
  {#if error !== ''}
    <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
      <span class="fa fa-exclamation" />
      <span style="margin-left: 5px;">{error}</span>
    </div>
  {/if}
  <div class="in">
    <input
      class="input"
      placeholder="Type and press Enter..."
      on:keyup={handleInput} />
  </div>
  <div class="list">
    {#each list as item}
      <button
        class="btn-fill btn-blue-bg item"
        on:click={() => {
          removeItem(item.id);
        }}>
        <div class="fa fa-times icon" />
        <div class="text">{item.value}</div>
      </button>
    {/each}
  </div>
</div>
