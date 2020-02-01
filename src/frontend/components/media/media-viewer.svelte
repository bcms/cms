<script>
  import { Store } from '../../config.svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import { viewerFileStore, fileType } from './file-explorer.svelte';
  import { OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
  import Button from '../global/button.svelte';

  let files = [];

  viewerFileStore.subscribe(value => {
    files = value;
  });
</script>

<style type="text/scss">
  .viewer {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 20px;
  }

  .file {
    display: grid;
    flex-direction: column;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  }

  .actions {
    display: flex;
    background-color: var(--c-gray-lighter);
  }

  .actions .menu {
    margin-left: auto;
  }
</style>

<div class="viewer">
  {#each files as file}
    <div class="file">
      <div class="actions">
        <div class="menu">
          <OverflowMenu>
            <OverflowMenuItem type="danger" text="Delete" on:click={() => {}} />
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
            simplePopup.error('Please user Explirer to enter a folder.');
          }
        }}>
        {file.name}
      </Button>
    </div>
    {#if file.type === 'IMG'}
      <div class="img mt-20">
        <img
          src="/media/file?path={encodeURIComponent(file.path + '/' + file.name)}&access_token={Store.get('accessToken')}"
          alt="NF" />
      </div>
    {/if}
  {/each}
</div>
