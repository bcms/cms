<script>
  import { createEventDispatcher } from 'svelte';
  import { Store } from '../../config.svelte';
  import { fileType } from './file-explorer.svelte';
  import FileExplorerItem from './file-explorer-item.svelte';

  export let events;
  export let parentFile;
  export let file;
  export let depth = 1;
  export let isOpened = false;
  export let isVisable = false;
  export let showFiles = false;
  export let onFileClick;
  export let showDeleteBtn = false;

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
    if (events) {
      events.close = () => {
        isOpened = false;
        childrenEvents.forEach(e => {
          if (e.close) {
            e.close();
          }
        });
      };
    }
  }
</script>

<style type="text/scss">
  .file {
    display: flex;
  }

  .file .toggle {
    text-align: left;
    padding: 3px;
    border: none;
    min-width: 100%;
    background-color: var(--c-neutral);
  }

  .file:hover .delete {
    max-width: 50px;
  }

  .file .delete {
    max-width: 0;
    transition: all 0.2s;
  }

  .file .delete button {
    border: none;
    color: var(--c-gray-light);
    background-color: #00000000;
    padding: 5px;
  }

  .file .delete button:hover {
    color: var(--c-error);
  }

  .file .toggle:hover {
    color: var(--c-primary-dark);
    background-color: var(--c-white-dark);
  }

  .file .toggle .icon {
    margin: auto 10px auto 0;
  }

  .file .toggle .name {
    white-space: nowrap;
    margin: auto 0;
    padding-right: 3px;
  }
</style>

{#if file.type === 'DIR' || showFiles === true}
  <div class="file" style="padding-left: {paddingSize - 10}px;">
    {#if showDeleteBtn === true}
      <div class="delete">
        <button
          class="fas fa-trash"
          style="display: {isVisable === true ? 'flex' : 'none'};"
          on:click={() => {
            dispatch('remove', file);
          }} />
      </div>
    {/if}
    <button
      class="toggle"
      style="padding-left: 10px; margin-bottom: 5px; display: {isVisable === true ? 'flex' : 'none'};"
      on:click={() => {
        if (file.type === 'DIR') {
          if (isOpened === true) {
            isOpened = false;
            dispatch('close', { parentFile, file, depth });
            events.close();
          } else {
            isOpened = true;
            dispatch('open', { parentFile, file, depth });
          }
        } else {
          if (onFileClick) {
            onFileClick(file);
          } else {
            window.open(`/media/file?path=${encodeURIComponent(file.path + '/' + file.name)}&access_token=${Store.get('accessToken')}`, '_blank');
          }
        }
      }}>
      {#if file.type === 'DIR' && isOpened === true}
        <span class="fas fa-folder-open icon" />
      {:else}
        <span class={fileType[file.type].faClass} />
      {/if}
      <span class="name">{file.name}</span>
    </button>
  </div>
{/if}
{#if file.type === 'DIR'}
  {#each file.children as child, i}
    <FileExplorerItem
      {showDeleteBtn}
      {showFiles}
      {onFileClick}
      events={childrenEvents[i]}
      parentFile={file}
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
      }}
      on:remove={event => {
        if (event.eventPhase === 0) {
          dispatch('remove', event.detail);
        }
      }} />
  {/each}
{/if}
