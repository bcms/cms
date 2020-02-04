<script>
  import { createEventDispatcher } from 'svelte';
  import { TextInput } from 'carbon-components-svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let value;

  const dispatch = createEventDispatcher();
</script>

<style type="text/scss">
  .widget {
    font-size: 10pt;
    font-weight: normal;
    margin-top: 30px;
  }

  .widget .head {
    display: flex;
    padding: 5px;
    background-color: #f4f4f4;
  }

  .widget .head .icon {
    color: var(--c-primary);
    margin: auto 0;
  }

  .widget .head .text {
    font-weight: normal;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: auto auto auto 20px;
  }

  .widget .head .move {
    font-size: 12pt;
    margin: auto 0;
  }

  .widget .props {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 20px;
    border-style: solid;
    border-color: #f4f4f4;
    border-width: 2px;
    padding: 20px;
  }
</style>

<div class="widget">
  <div class="head">
    <span class="fas fa-pepper-hot icon" />
    &nbsp;
    <span class="text">Media</span>
    <div class="move up">
      <Button
        icon="fas fa-angle-up"
        onlyIcon={true}
        kind="ghost"
        size="small"
        on:click={() => {
          dispatch('move', 'up');
        }} />
    </div>
    <div class="move down">
      <Button
        icon="fas fa-angle-down"
        onlyIcon={true}
        kind="ghost"
        size="small"
        on:click={() => {
          dispatch('move', 'down');
        }} />
    </div>
    <div class="delete">
      <Button
        icon="fas fa-trash"
        kind="danger"
        size="small"
        on:click={() => {
          dispatch('delete', 'none');
        }}>
        Remove
      </Button>
    </div>
  </div>
  <div class="props">
    <TextInput
      value={value}
      placeholder="/path/to/media/file"
      on:input />
  </div>
</div>
