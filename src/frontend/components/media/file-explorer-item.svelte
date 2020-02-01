<script>
  import { createEventDispatcher } from 'svelte';
  import { fileType } from './file-explorer.svelte';
  import FileExplorerItem from './file-explorer-item.svelte';

  export let file;
  export let depth = 1;
  export let isOpened = false;
  export let isVisable = false;

  const dispatch = createEventDispatcher();

  if (isVisable === false) {
    isOpened = false;
  }

  if (file.type === 'DIR') {
    file.children.sort((a, b) => {
      if (a.type === 'DIR' && b.type !== 'DIR') {
        return -1;
      } else if (a.type !== 'DIR' && b.type === 'DIR') {
        return 1;
      }
      return 0;
    });
  }

  let paddingSize = 10 * depth;
</script>

<style type="text/scss">
  .file {
    text-align: left;
    padding: 3px;
    border: none;
  }

  .file:hover {
    color: var(--c-primary-dark);
    background-color: var(--c-gray-light);
  }
</style>

<button
  class="file"
  style="padding-left: {paddingSize}px; margin-bottom: 5px; display: {isVisable === true ? 'block' : 'none'};"
  on:click={() => {
    if (file.type === 'DIR') {
      if (isOpened === true) {
        isOpened = false;
        dispatch('close', file);
      } else {
        isOpened = true;
        dispatch('open', file);
      }
    }
  }}>
  <span class="{fileType[file.type].faClass} icon" />
  &nbsp;
  <span class="name">{file.name}</span>
</button>
{#if file.type === 'DIR'}
  {#each file.children as child}
    <FileExplorerItem
      file={child}
      isVisable={isVisable === false ? false : isOpened}
      depth={depth + 1}
      on:close={event => {
        if (event.eventPhase === 0) {
          dispatch('close', event.detail);
        }
      }}
      on:open={event => {
        if (event.eventPhase === 0) {
          dispatch('open', event.detail);
        }
      }} />
  {/each}
{/if}
