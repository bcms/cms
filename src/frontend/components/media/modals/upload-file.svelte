<script>
  import { createEventDispatcher } from 'svelte';
  import TextInput from '../../global/text-input.svelte';
  import { FileUploaderDropContainer } from 'carbon-components-svelte';
  import Modal from '../../global/modal/modal.svelte';

  export let folder;
  export let events;

  const dispatch = createEventDispatcher();
  let nameInputDisabled = false;
  let fileName = {
    value: '',
    error: '',
  };
  let data = {
    files: [],
    // fileName: '',
    // file: {
    //   error: '',
    // },
  };

  function handleNameInput(event) {
    const value = event.value
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^0-9a-z---]+/g, '');
    fileName.value = value;
    event.value = value;
  }

  events.cancel = () => {
    data = {
      files: [],
    };
    fileName = {
      value: '',
      error: '',
    };
    events.toggle();
  };
  events.done = () => {
    if (data.files.length === 1) {
      console.log('HERE');
      if (!fileName.value) {
        fileName.error = 'File is missing.';
        return;
      }
      fileName.error = '';
      if (fileName.value !== '') {
        data.files[0].fileName = data.files[0].fileName.split('.').map((e, i) => {
          if (i === 0) {
            return fileName.value;
          }
          return e;
        }).join('.');
      }
    }
    events.callback({ files: data.files });
    data = {
      files: [],
    };
    fileName = {
      value: '',
      error: '',
    };
    events.toggle();
    // const nameParts = data.file.value.name.split('.');
    // nameParts[0] = data.fileName.split('.')[0];
    // const fileName = nameParts.join('.');
    // // events.callback({ fileName, file: data.file.value });
    // data = {
    //   files: [],
    //   // fileName: '',
    //   // file: {
    //   //   error: '',
    //   // },
    // };
    // events.toggle();
  };
</script>

<style type="text/scss">
  .file-area {
    margin: 30px auto;
  }
</style>

<Modal heading={{ title: 'Upload file' }} {events}>
  <p>
    File fill be added to
    <i>"{folder}"</i>
  </p>
  <TextInput
    labelText="File name"
    helperText="This field is optionsl."
    value={fileName.value}
    disabled={nameInputDisabled}
    placeholder="- File Name -"
    on:input={event => {
      if (event.eventPhase === 0) {
        handleNameInput({ value: event.detail });
      }
    }} />
  <div class="file-area">
    <FileUploaderDropContainer
      style="width: 100%;"
      labelText="Drag and drop files here or click to upload"
      invalid={fileName.error !== '' ? true : false}
      invalidText={fileName.error}
      multiple={true}
      on:add={event => {
        data.files = Array.from(event.detail).map(e => {
          return { fileName: e.name
                .split('.')[0]
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/_/g, '-')
                .replace(/[^0-9a-z---]+/g, '') + '.' + e.name
                .split('.')
                .slice(1)
                .join('.'), value: e };
        });
        if (data.files.length > 1) {
          nameInputDisabled = true;
        } else {
          nameInputDisabled = false;
          fileName.value = data.files[0].fileName.split('.')[0];
        }
      }} />
  </div>
</Modal>
