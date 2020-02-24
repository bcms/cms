<script>
  import { onMount } from 'svelte';
  import { TextInput } from 'carbon-components-svelte';
  import Modal from '../../global/modal/modal.svelte';
  import OnOff from '../../on-off.svelte';
  import StringUtil from '../../../string-util.js';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;
  export let files;

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
    for (const i in filess) {
      if (filess[i].type === 'DIR') {
        if (filess[i].name === name) {
          return filess[i];
        } else {
          const file = findDir(filess[i].children, name);
          if (file) {
            return file;
          }
        }
      }
    }
    return undefined;
  }
  // async function containsErrors() {
  //   if (data.name.value === '') {
  //     data.name.error = 'Input cannot be empty.';
  //     return true;
  //   }
  //   data.name.error = '';
  //   const result = await axios.send({
  //     url: `/media/exist?path=${root + '/' + data.name.value}`,
  //     method: 'GET',
  //   });
  //   if (result.success === false) {
  //     simplePopup.error(result.error.response.data.message);
  //     return true;
  //   }
  //   if (result.response.data.exist === true) {
  //     data.name.error = `Folder with name '${data.name.value}' already exist at this path.`;
  //     return true;
  //   }
  //   data.name.error = '';
  //   return false;
  // }

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
      handleNameInput(event.target);
    }} />
</Modal>
