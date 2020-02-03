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
  export const fileStore = writable([]);
  export const pushFile = writable();
  export const popFile = writable();

  let cacheTill = 0;

  function fatch() {
    if (cacheTill === 0 || cacheTill < Date.now()) {
      cacheTill = Date.now() + 60000;
      axios
      .send({
        url: '/media/all/aggregate',
        method: 'GET',
      })
      .then(result => {
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
        fileStore.update(value => result.response.data.media);
        viewerFileStore.update(value => result.response.data.media);
      });
    }
  }
  fatch();
</script>

<script>
  import { onMount, createEventDispatcher, onDestroy } from 'svelte';
  import { axios, Store } from '../../config.svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import FileExplorerItem from './file-explorer-item.svelte';

  const dispatch = createEventDispatcher();
  let files = [];
  let firstTimeLoad = true;

  fileStore.subscribe(value => {
    files = sort(value);
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
  })
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
</style>

<div class="wrapper">
  <div class="heading">EXPLORER</div>
  <div class="files">
    {#each files as file}
      <FileExplorerItem
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
        }} />
    {/each}
  </div>
</div>
