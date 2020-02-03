<script>
  import {Store} from '../../../config.svelte';
  import Modal from './modal.svelte';
  import FileExplorer, {
    fileStore,
    viewerFileStore,
    pushFile,
    popFile,
  } from '../../media/file-explorer.svelte';

  export let events;

  let fileSelected;
</script>

<style type="text/scss">
  .picker {
    overflow: hidden;
  }

  .short {
    height: 40%;
  }

  .file-preview .img img {
    width: 100%;
  }
</style>

<Modal
  width={600}
  heading={{ title: 'Media Picker' }}
  {events}
  on:cancel={event => {}}
  on:done={event => {}}>
  <div class="picker">
    <div class="bx--label">File explorer</div>
    <div class="short">
      <FileExplorer onFileClick={file => {
        fileSelected = file;
      }} showFiles={true} />
    </div>
    <div class="bx--label mt-20">Selected file</div>
    <div class="file-preview">
      {#if fileSelected}
        {#if fileSelected.type === 'IMG'}
        <div class="img">
          <img
            src="/media/file?path={encodeURIComponent(fileSelected.path + '/' + fileSelected.name)}&access_token={Store.get('accessToken')}"
            alt="NF" />
        </div>
      {/if}
      {:else}
        <h4>No file selected</h4>
      {/if}
    </div>
  </div>
</Modal>
