<script context="module">
  import { writable } from 'svelte/store';

  export const fileType = {
    DIR: { value: 'DIR', faClass: 'fas fa-folder icon' },
    IMG: { value: 'IMG', faClass: 'fas fa-image icon' },
    VID: { value: 'VID', faClass: 'fas fa-video icon' },
    TXT: { value: 'TXT', faClass: 'fas fa-file-alt icon' },
    GIF: { value: 'GIF', faClass: 'fas fa-smile-beam icon' },
    OTH: { value: 'OTH', faClass: 'fas fa-file icon' },
    PDF: { value: 'PDF', faClass: 'fas fa-file-pdf icon' },
    CODE: { value: 'CODE', faClass: 'fas fa-code icon' },
    FONT: { value: 'FONT', faClass: 'fas fa-font icon' },

    JS: { value: 'JS', faClass: 'fab fa-js-square icon' },
    HTML: { value: 'HTML', faClass: 'fab fa-html5 icon' },
    CSS: { value: 'CSS', faClass: 'fab fa-css3-alt icon' },
    JSVS: { value: 'JAVA', faClass: 'fab fajava icon' },
    PHP: { value: 'PHP', faClass: 'fab fa-php icon' },
  };
  export const viewerFileStore = writable([]);
  viewerFileStore.set([]);
</script>

<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { axios, Store } from '../../config.svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import FileExplorerItem from './file-explorer-item.svelte';

  const dispatch = createEventDispatcher();
  let files = [];

  onMount(async () => {
    const result = await axios.send({
      url: '/media/all/aggregate',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    result.response.data.media.sort((a, b) => {
      if (a.type === 'DIR' && b.type !== 'DIR') {
        return -1;
      } else if (a.type !== 'DIR' && b.type === 'DIR') {
        return 1;
      }
      return 0;
    });
    files = result.response.data.media;
    viewerFileStore.update(value => files);
  });
</script>

<style type="text/scss">
  .wrapper {
    width: 100%;
    height: 97vh;
    background-color: var(--c-white-normal);
    padding: 30px 20px 0 20px;
    padding-left: 20px;
    margin: auto 0;
    overflow-x: auto;
    overflow-y: auto;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  }
  .wrapper .heading {
    color: #919bae;
    font-size: 10pt;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 20px;
  }

  .files {
    display: flex;
    flex-direction: column;
  }
</style>

<div class="wrapper">
  <div class="heading">EXPLORER</div>
  <div class="files">
    {#each files as file}
      <FileExplorerItem
        {file}
        isVisable={true}
        on:close={event => {
          if (event.eventPhase === 0) {
            const f = event.detail;
            dispatch('close', f);
            if (f.isInRoot === true) {
              viewerFileStore.update(value => files);
            } else {
              viewerFileStore.update(value => file.children);
            }
          }
        }}
        on:open={event => {
          if (event.eventPhase === 0) {
            dispatch('open', event.detail);
            const f = event.detail;
            viewerFileStore.update(value => f.children);
          }
        }} />
    {/each}
  </div>
</div>
