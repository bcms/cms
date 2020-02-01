<script>
  import { createEventDispatcher } from 'svelte';
  import { Store } from '../../config.svelte';
  import { fileType } from './file-explorer.svelte';
  import FileExplorerItem from './file-explorer-item.svelte';

  export let events;
  export let file;
  export let depth = 1;
  export let isOpened = false;
  export let isVisable = false;

  const dispatch = createEventDispatcher();
  let childrenEvents = [];
  let paddingSize = 10 * depth;

  if (isVisable === false) {
    isOpened = false;
  }

  if (file.type === 'DIR') {
    if (!file.children) {
      file.children = [];
    }
    file.children.sort((a, b) => {
      if (a.type === 'DIR' && b.type !== 'DIR') {
        return -1;
      } else if (a.type !== 'DIR' && b.type === 'DIR') {
        return 1;
      }
      return 0;
    });
    childrenEvents = file.children.map(e => {
      return {};
    });
    events.close = () => {
      isOpened = false;
      childrenEvents.forEach(e => {
        e.close();
      });
    };
  }
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
  style="padding-left: {paddingSize}px;
  margin-bottom: 5px; display: {isVisable === true ? 'block' : 'none'};"
  on:click={() => {
    if (file.type === 'DIR') {
      if (isOpened === true) {
        isOpened = false;
        dispatch('close', { file, depth });
        events.close();
      } else {
        isOpened = true;
        dispatch('open', { file, depth });
      }
    } else {
      window.open(`/media/file?path=${encodeURIComponent(file.path + '/' + file.name)}&access_token=${Store.get('accessToken')}`, '_blank');
    }
  }}>
  {#if file.type === 'DIR' && isOpened === true}
    <span class="fas fa-folder-open icon" />
  {:else}
    <span class={fileType[file.type].faClass} />
  {/if}
  &nbsp;
  <span class="name">{file.name}</span>
</button>
{#if file.type === 'DIR'}
  {#each file.children as child, i}
    <FileExplorerItem
      events={childrenEvents[i]}
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
