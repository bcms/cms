<script>
  import { onMount } from 'svelte';
  import { axios, Store, fileStore } from '../../../config.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import Button from '../../../components/global/button.svelte';
  import FileExplorer, {
    viewerFileStore,
    pushFile,
    popFile,
  } from '../../../components/media/file-explorer.svelte';
  import MediaViewer, {
    viewerPushFile,
    viewerPopFile,
  } from '../../../components/media/media-viewer.svelte';
  import CreateDirModal from '../../../components/media/modals/create-dir.svelte';
  import UploadFileModal from '../../../components/media/modals/upload-file.svelte';
  import UrlQueries from '../../../url-queries.js';
  import Base64 from '../../../base64.js';
  import StringUtil from '../../../string-util.js';

  const accessToken = JSON.parse(
    Base64.decode(Store.get('accessToken').split('.')[1]),
  );
  const createDirModalEvents = { callback: createDir };
  const uploadFileModalEvents = { callback: uploadFile };
  let files = [];
  let viewPath = [
    {
      _id: 'media',
      name: '/media',
      type: 'DIR',
    },
  ];

  fileStore.subscribe(value => {
    files = value;
  });

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
      url: `/media/folder?path=${encodeURIComponent(
        '/' +
          viewPath
            .filter((e, i) => i > 0)
            .map(e => {
              return e.name;
            })
            .join('/') +
          '/' +
          name,
      )}`,
      method: 'POST',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Folder created!');
    const f = result.response.data.media;
    f.children = [];
    if (f.isInRoot === true) {
      fileStore.update(value => [...value, f]);
    } else {
      pushFile.update(value => f);
    }
    viewerPushFile.update(value => f);
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
  async function deleteDir(file) {
    if (
      confirm(
        `Are you sure you want to delete '${file.name}' folder?\n\n` +
          `THIS WILL DELETE ALL CHILD CONTENT AND ACTION IN IRREVERSABLE!`,
      )
    ) {
      const result = await axios.send({
        url: `/media/folder/${file._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success(`Folder '${file.name}' deleted successfully.`);
      if (file.isInRoot === true) {
        fileStore.update(value => value.filter(e => e._id !== file._id));
      } else {
        popFile.update(value => file);
      }
      viewerPopFile.update(value => file);
    }
  }
  async function deleteFile(file) {
    if (
      confirm(
        `Are you sure you want to delete '${file.name}'?\n\n` +
          `THIS WILL DELETE ALL CHILD CONTENT AND ACTION IN IRREVERSABLE!`,
      )
    ) {
      const result = await axios.send({
        url: `/media/file/${file._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success(`File '${file.name}' deleted successfully.`);
      popFile.update(value => file);
      viewerPopFile.update(value => file);
      // fileStore.update(value => files.filter(i => i._id !== file._id));
      // viewerFileStore.update(value => value.filter(e => e._id !== file._id));
    }
  }
  async function uploadFile(data) {
    const file = data.file;
    const fd = new FormData();
    fd.append('media_file', file, data.fileName);
    const result = await axios.send({
      url: `/media/file?path=${encodeURIComponent(
        '/' +
          viewPath
            .filter((e, i) => i > 0)
            .map(e => {
              return e.name;
            })
            .join('/'),
      )}`,
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
    const f = result.response.data.media;
    if (f.isInRoot === true) {
      fileStore.update(value => [...value, f]);
    } else {
      pushFile.update(value => f);
    }
    viewerPushFile.update(value => f);
  }
</script>

<style type="text/scss">
  @import './overview.scss';
</style>

<Layout>
  {#if accessToken && (accessToken.customPool.policy.media.get === true || accessToken.roles[0].name === 'ADMIN')}
    <div class="wrapper">
      <FileExplorer
        on:close={event => {
          if (event.eventPhase === 0) {
            const f = event.detail.file;
            viewPath = viewPath.filter((e, i) => {
              if (i >= event.detail.depth) {
                return false;
              }
              return true;
            });
          }
        }}
        on:open={event => {
          if (event.eventPhase === 0) {
            const f = event.detail.file;
            viewPath = [...viewPath, { _id: f._id, type: f.type, name: f.name }];
          }
        }} />
      <div class="viewer-wrapper">
        <div class="viewer">
          <div class="heading">
            <div class="title">Media Manager</div>
            <div class="path">
              {viewPath
                .map(e => {
                  return e.name;
                })
                .join('/')}
            </div>
          </div>
          <div class="dir-actions mt-30 mb-30">
            {#if accessToken.customPool.policy.media.post === true || accessToken.roles[0].name === 'ADMIN'}
              <Button
                icon="fas fa-upload"
                on:click={() => {
                  uploadFileModalEvents.toggle();
                }}>
                Upload file
              </Button>
              <div class="create">
                <Button
                  icon="fas fa-plus"
                  kind="ghost"
                  on:click={() => {
                    createDirModalEvents.setRootPath(viewPath
                        .map(e => {
                          return e.name;
                        })
                        .join('/'));
                    createDirModalEvents.toggle();
                  }}>
                  Create new folder
                </Button>
              </div>
            {/if}
          </div>
          <MediaViewer
            {accessToken}
            {viewPath}
            on:remove={event => {
              if (event.eventPhase === 0) {
                const file = event.detail;
                if (file.type !== 'DIR') {
                  deleteFile(file);
                } else {
                  deleteDir(file);
                }
              }
            }} />
        </div>
      </div>
    </div>
  {/if}
</Layout>
<CreateDirModal {axios} events={createDirModalEvents} />
<UploadFileModal
  folder={viewPath
    .map(e => {
      return e.name;
    })
    .join('/')}
  events={uploadFileModalEvents} />
