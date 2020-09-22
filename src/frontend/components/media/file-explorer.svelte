<script context="module">
  import { writable } from 'svelte/store';
  import Button from '../global/button.svelte';

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
  export const pushFile = writable();
  export const popFile = writable();
</script>

<script>
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { axios, Store, fileStore, fatch } from '../../config.svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import FileExplorerItem from './file-explorer-item.svelte';

  export let showDeleteBtn = false;
  export let showFiles = false;
  export let onFileClick;

  const dispatch = createEventDispatcher();
  const screenWidth = window.innerWidth;
  let show = screenWidth < 900 ? false : true;
  let files = [];
  let firstTimeLoad = true;

  fileStore.subscribe(value => {
    if (value) {
      files = sort(value);
      viewerFileStore.update(value => files);
    }
  });
  pushFile.subscribe(value => {
    if (value) {
      let path = '';
      if (value.type === 'DIR') {
        path = value.path
          .split('/')
          .slice(0, value.path.split('/').length - 1)
          .join('/');
      } else {
        path = value.path;
      }
      const result = push(value, files, path);
      if (result.found === true) {
        fileStore.update(v => [...result.files]);
      }
    }
  });
  popFile.subscribe(value => {
    if (value) {
      const result = pop(value, files);
      if (result.found === true) {
        fileStore.update(v => [...result.files]);
      }
    }
  });

  function push(file, filess, path) {
    for (const i in filess) {
      const f = filess[i];
      if (f.type === 'DIR') {
        if (f.path === path) {
          f.children.push(file);
          return {
            found: true,
            files: filess,
          };
        } else {
          const result = push(file, f.children, path);
          if (result.found === true) {
            f.children = result.files;
            return {
              found: true,
              files: filess,
            };
          }
        }
      }
    }
    return {
      found: false,
    };
  }
  function pop(file, filess) {
    for (const i in filess) {
      if (filess[i].type === 'DIR') {
        if (filess[i].path === file.path) {
          if (file.type === 'DIR') {
            filess = filess.filter(e => e._id !== file._id);
            return {
              found: true,
              files: filess,
            };
          }
          filess[i].children = filess[i].children.filter(
            e => e._id !== file._id,
          );
          return {
            found: true,
            files: filess,
          };
        } else {
          const result = pop(file, filess[i].children);
          if (result.found === true) {
            filess[i].children = result.files;
            return {
              found: true,
              files: filess,
            };
          }
        }
      }
    }
    return {
      found: false,
    };
  }
  function sort(filess) {
    if (!filess) {
      return [];
    }
    const dirs = filess.filter(e => e.type === 'DIR');
    const fs = filess.filter(e => e.type !== 'DIR');
    dirs.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    dirs.forEach(dir => {
      dir.children = sort(dir.children);
    });
    fs.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return [...dirs, ...fs];
  }

  onMount(async () => {
    fatch();
  });
  onDestroy(() => {
    viewerFileStore.update(value => files);
  });
</script>

<style type="text/scss">
  .file-explorer {
    width: 100%;
    height: 100%;
    padding: 30px 20px 0 20px;
    margin: auto 0;
    overflow: auto;
    border-right: 1px solid #e0e0e0;
    background-color: var(--c-neutral);
  }
  .file-explorer .heading {
    color: #919bae;
    font-size: 10pt;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 20px;
  }

  .toggle-menu {
    position: fixed;
    bottom: 70px;
    left: 0;
    transition: all 0.35s;
  }
</style>

{#if show === true}
  <div class="file-explorer">
    <div class="heading">EXPLORER</div>
    <div class="items">
      {#each files as file}
        {#if file.type === 'DIR' || showFiles === true}
          <FileExplorerItem
            {showDeleteBtn}
            {showFiles}
            {onFileClick}
            events={{}}
            {file}
            isVisable={true}
            on:close={event => {
              if (event.eventPhase === 0) {
                const f = event.detail.file;
                const pf = event.detail.parentFile;
                dispatch('close', event.detail);
                if (f.isInRoot === true) {
                  viewerFileStore.update(value => files);
                } else {
                  viewerFileStore.update(value => pf.children);
                }
              }
            }}
            on:open={event => {
              if (event.eventPhase === 0) {
                dispatch('open', event.detail);
                const f = event.detail.file;
                viewerFileStore.update(value => f.children);
              }
            }}
            on:remove={event => {
              if (event.eventPhase === 0) {
                dispatch('remove', event.detail);
              }
            }} />
        {/if}
      {/each}
    </div>
  </div>
{/if}
{#if screenWidth < 900}
  <div class="toggle-menu {show === true ? 'toggle-menu-show' : ''}">
    <Button
      icon="fas fa-bars"
      onlyIcon={true}
      on:click={() => {
        show = !show;
      }} />
  </div>
{/if}
