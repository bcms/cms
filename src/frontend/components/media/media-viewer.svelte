<script context="module">
  import { writable } from 'svelte/store';

  export const viewerPushFile = writable();
  export const viewerPopFile = writable();
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import { Store } from '../../config.svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import { viewerFileStore, fileType } from './file-explorer.svelte';
  import { OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let accessToken;
  export let viewPath;

  const dispatch = createEventDispatcher();
  let files = [];

  viewerFileStore.subscribe(value => {
    const dirs = value.filter(e => e.type === 'DIR');
    const fs = value.filter(e => e.type !== 'DIR');
    dirs.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    fs.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    files = [...dirs, ...fs];
  });
  viewerPushFile.subscribe(value => {
    if (value) {
      if (!files.find(e => e._id === value._id)) {
        viewerFileStore.update(v => [...files, value]);
      } else {
        viewerFileStore.update(v => [...files]);
      }
    }
  });
  viewerPopFile.subscribe(value => {
    if (value) {
      viewerFileStore.update(v => files.filter(e => e._id !== value._id));
    }
  });
</script>

<style type="text/scss">
  .viewer {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 250px));
    grid-gap: 20px;
  }

  .file {
    display: grid;
    flex-direction: column;
    margin-bottom: auto;
    border: 5px solid var(--c-gray-lighter);
  }

  .actions {
    display: flex;
    background-color: var(--c-gray-lighter);
  }

  .actions .menu {
    margin-left: auto;
  }

  .img {
    width: 100%;
    text-align: center;
    padding: 10px;
  }

  .img img {
    width: 100%;
  }
</style>

<div class="viewer">
  {#if files.length === 0}
    <h4 class="no-files"><u>{StringUtil.prettyName(viewPath[viewPath.length - 1].name.replace(/\//g, ''))}</u> folder is empty.</h4>
  {/if}
  {#each files as file}
    <div class="file">
      <div class="actions">
        <div class="menu">
          <OverflowMenu>
            <!-- {#if file.type !== 'DIR'} -->
            <OverflowMenuItem
              text="Copy Path"
              on:click={() => {
                navigator.clipboard
                  .writeText(`${viewPath
                      .map(e => {
                        return e.name;
                      })
                      .join('/')}/${file.name}`)
                  .then(() => {
                    simplePopup.success('Path copied.');
                  });
              }} />
            <!-- {/if} -->
            {#if accessToken.customPool.policy.media.delete === true || accessToken.roles[0].name === 'ADMIN'}
              <OverflowMenuItem
                danger={true}
                text="Delete"
                on:click={() => {
                  dispatch('remove', file);
                }} />
            {/if}
          </OverflowMenu>
        </div>
      </div>
      <Button
        style="width: 100%;"
        icon={fileType[file.type].faClass}
        kind="ghost"
        on:click={() => {
          if (file.type !== 'DIR') {
            window.open(`/media/file?path=${encodeURIComponent(file.path + '/' + file.name)}&access_token=${Store.get('accessToken')}`, '_blank');
          } else {
            simplePopup.error('Please user Explorer to enter a folder.');
          }
        }}>
        {file.name.length > 25 ? `${file.name.substring(0, 25)} ...` : file.name}
      </Button>
      {#if file.type === 'IMG'}
        <div class="img mt-20">
          <img
            src="/media/file?path={encodeURIComponent(file.path + '/' + file.name)}&access_token={Store.get('accessToken')}"
            alt="NF" />
        </div>
      {/if}
    </div>
  {/each}
</div>
