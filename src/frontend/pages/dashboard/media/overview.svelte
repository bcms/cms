<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import FolderTree, {
    folderTreeActions,
    folderTreeType,
  } from '../../../components/media/folder-tree.svelte';
  import CreateDirModal from '../../../components/media/modals/create-dir.svelte';
  import UrlQueries from '../../../url-queries.js';
  import Base64 from '../../../base64.js';
  import StringUtil from '../../../string-util.js';

  export let axios;
  export let Store;

  const createDirModalEvents = { callback: createDir };
  let inFolder = '/';
  let items = [];
  let folderTreeEvents = {
    click: (type, domEl, ft, state) => {
      if (type === 'dir') {
        inFolder = ft.path;
        if (ft.children) {
          items = JSON.parse(JSON.stringify(ft.children.map(e => {
            return {
              _id: e._id,
              type: e.type,
              name: e.name,
              path: e.path,
            };
          })));
        }
      }
    },
    init: ft => {
      items = JSON.parse(JSON.stringify(ft.map(e => {
        return {
          _id: e._id,
          type: e.type,
          name: e.name,
          path: e.path,
        };
      })));
    },
  };

  function itemClicked(item) {
    folderTreeActions.setActive(JSON.parse(JSON.stringify(item)));
  }
  function shortenName(name, lng) {
    if (name.length > lng) {
      const parts = name.split('.');
      if (parts.length > 1) {
        const ext = parts.slice(parts.length - 1, parts.length);
        const other = parts.slice(0, parts.length - 1).join('.');
        return `${other.substring(0, lng - 3)} ... ${ext}`;
      } else {
        return `${name.substring(0, lng - 3)} ... `;
      }
    } else {
      return name;
    }
  }
  async function createDir(name) {
    const result = await axios.send({
      url: `/media/folder?path=${encodeURIComponent(inFolder + '/' + name)}`,
      method: 'POST',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Folder created!');
    await folderTreeActions.render();
    inFolder = `${inFolder}/${name}`.replace(/\/\//g, '/');
    const media = result.response.data.media;
    folderTreeActions.setActive({
      _id: media._id,
      type: media.type,
      path: media.path,
      name: media.name,
    });
  }
  async function editName(item) {
    let name = prompt('Enter new name:');
    if (name === null) {
      return;
    }
    name = name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^0-9a-z---]+/g, '');
    if (name === '') {
      simplePopup.error('Name cannot be empty string.');
      return;
    }
  }
  async function deleteDir(item) {
    if (
      confirm(
        `Are you sure you want to delete '${item.name}' folder?\n\n` +
          `THIS WILL DELETE ALL CHILD CONTENT AND ACTION IN IRREVERSABLE!`,
      )
    ) {
      const result = await axios.send({
        url: `/media/folder/${item._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success(`Folder '${item.name}' deleted successfully.`);
      items = items.filter(i => i._id !== item._id);
      await folderTreeActions.render();
    }
  }
  async function deleteFile(item) {
    console.log(item);
    if (
      confirm(
        `Are you sure you want to delete '${item.name}'?\n\n` +
          `THIS WILL DELETE ALL CHILD CONTENT AND ACTION IN IRREVERSABLE!`,
      )
    ) {
      const result = await axios.send({
        url: `/media/file/${item._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success(`File '${item.name}' deleted successfully.`);
      items = items.filter(i => i._id !== item._id);
      await folderTreeActions.render();
    }
  }
  async function uploadFile(event) {
    const file = document.getElementById('upload-file').files[0];
    const fd = new FormData();
    fd.append('media_file', file, file.fileName);
    const result = await axios.send({
      url: `/media/file?path=${encodeURIComponent(inFolder)}`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data`,
      },
      data: fd,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('File uploaded succesfully.');
    items = [
      ...items,
      result.response.data.media
    ]
    await folderTreeActions.render();
  }
</script>

<style>
  .content-layout {
    display: grid;
    grid-template-columns: 400px auto;
    height: 100%;
  }

  .viewer {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 20px;
  }

  .viewer .heading {
    display: flex;
    flex-direction: column;
  }

  .viewer .heading .title {
    font-size: 18pt;
    font-weight: bold;
  }

  .viewer .heading .path {
    font-size: 10pt;
    color: #929292;
  }

  .dir-actions {
    margin-top: 30px;
    padding: 20px;
    display: flex;
  }

  .dir-actions .create {
    margin-left: auto;
  }

  .dir-actions .upload {
    margin-left: 20px;
  }

  .view {
    padding: 20px;
    margin-top: 10px;
  }

  .view .items {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: 20px;
  }

  .view .items .item {
    display: flex;
    flex-direction: column;
    background-color: var(--c-white);
    padding: 10px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
    font-size: 10pt;
    margin-bottom: auto;
    text-align: left;
    border: none;
  }

  .view .items .item .img {
    display: flex;
    margin-bottom: 10px;
  }

  .view .items .item .img img {
    width: 100px;
    margin: 0 auto;
  }

  .view .items .item .info .name {
    margin-left: 10px;
  }

  .view .items .item .actions {
    display: flex;
    margin: auto 0;
    margin-top: 10px;
    opacity: 0;
    max-height: 0;
    transition: 0.4s;
    overflow: hidden;
  }

  .view .items .item:hover .actions {
    opacity: 1;
    max-height: 100px;
    transition: 0.4s;
  }

  .view .items .item .actions .edit {
    margin-left: auto;
  }

  .view .no-items {
    text-align: center;
    font-size: 16pt;
    color: #929292;
  }
</style>

<Layout {axios} {Store}>
  <div class="content-layout">
    <FolderTree {axios} events={folderTreeEvents} {Store} />
    <div class="viewer">
      <div class="heading">
        <div class="title">Media Manager</div>
        <div class="path">{inFolder}</div>
      </div>
      <div class="dir-actions">
        <button
          class="btn-border btn-blue-br btn-blue-c create"
          on:click={() => {
            createDirModalEvents.setRootPath(inFolder);
            createDirModalEvents.toggle();
          }}>
          <div class="fas fa-plus icon" />
          <div class="text">Create New Folder</div>
        </button>
        <div class="btn-border btn-green-br btn-green-c upload">
          <div class="fas fa-plus icon" />
          <input
            id="upload-file"
            class="text"
            type="file"
            placeholder="Upload File"
            on:change={event => {
              uploadFile(event);
            }} />
        </div>
      </div>
      <div class="view">
        {#if items.length > 0}
          <div class="items">
            {#each items as item}
              <div class="item">
                <button
                  class="btn info"
                  on:click={() => {
                    itemClicked(item);
                  }}>
                  <span class="{folderTreeType[item.type].faClass} icon" />
                  <span class="name">{shortenName(item.name, 20)}</span>
                </button>
                {#if item.type === 'IMG'}
                  <div class="img">
                    <img
                      src="/media/file?path={encodeURIComponent(item.path + '/' + item.name)}&access_token={Store.get('accessToken')}"
                      alt="NF" />
                  </div>
                {/if}
                <div class="actions">
                  <button
                    class="btn-border btn-red-br btn-red-c delete"
                    on:click={() => {
                      if (item.type === 'DIR') {
                        deleteDir(item);
                      } else {
                        deleteFile(item);
                      }
                    }}>
                    <div class="fas fa-trash-alt icon" />
                    <div class="text">Delete</div>
                  </button>
                  <button
                    class="btn-fill btn-blue-bg edit"
                    on:click={() => {
                      editName(item);
                    }}>
                    <div class="fas fa-edit icon" />
                    <div class="text">Edit</div>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-items">This folder is empty</div>
        {/if}
      </div>
    </div>
  </div>
</Layout>
<CreateDirModal {axios} events={createDirModalEvents} />
