<script>
  import { onMount } from 'svelte';
  import TextInput from '../../global/text-input.svelte';
  import Modal from '../../global/modal/modal.svelte';
  import StringUtil from '../../../string-util.js';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;
  export let files;
  export let folder;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_groups.png',
    title: 'Create New Folder',
  };
  let root = '/';
  let data = {
    name: {
      value: '',
      error: '',
    },
  };

  function handleNameInput(event) {
    const value = event.value
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^0-9a-z---]+/g, '');
    data.name.value = value;
    event.value = value;
  }
  function findDir(filess, name) {
    const path = folder.replace('/media', '') + `/${name}`;
    const isRoot = path === '' ? true : false;
    for (const i in filess) {
      const file = filess[i];
      if (file.type === 'DIR') {
        if (isRoot === true) {
          if (file.type === 'DIR' && file.name === name) {
            console.log('H0', isRoot, path, file);
            return file;
          }
        } else {
          if (file.path === path) {
            if (file.name === name) {
              console.log('H1', isRoot, path, file);
              return file;
            }
          } else {
            const foundFile = findDir(filess[i].children, name);
            if (foundFile) {
              console.log('H2', isRoot, path, foundFile);
              return foundFile;
            }
          }
        }
      }
    }
    return undefined;
  }

  events.setRootPath = rootPath => {
    root = '' + rootPath;
  };
  events.cancel = () => {
    events.toggle();
    data = {
      name: {
        value: '',
        error: '',
      },
    };
  };
  events.done = async () => {
    if (data.name.value.replace(/ /g, '') === '') {
      data.name.error = 'Name cannot be empty.';
      return;
    }
    if (findDir(files, data.name.value)) {
      data.name.error = `Folder with name "${data.name.value}" already exist.`;
      return;
    }
    data.name.error = '';
    events.toggle();
    if (events.callback) {
      events.callback(data.name.value);
    }
    data = {
      name: {
        value: '',
        error: '',
      },
    };
  };
  onMount(() => {});
</script>

<Modal heading={modalHeading} {events}>
  <TextInput
    labelText="File name"
    value={data.name.value}
    invalid={data.name.error !== '' ? true : false}
    invalidText={data.name.error}
    placeholder="- File Name -"
    on:input={event => {
      if (event.eventPhase === 0) {
        handleNameInput({ value: event.detail });
      }
    }} />
</Modal>
