<script>
  import { createEventDispatcher } from 'svelte';
  import TextInput from '../../global/text-input.svelte';
  import { FileUploaderDropContainer } from 'carbon-components-svelte';
  import Modal from '../../global/modal/modal.svelte';

  export let folder;
  export let events;

  const dispatch = createEventDispatcher();
  let data = {
    fileName: '',
    file: {
      error: '',
    },
  };

  function handleNameInput(event) {
    const value = event.value
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^0-9a-z---]+/g, '');
    data.fileName = value;
    event.value = value;
  }

  events.cancel = () => {
    let data = {
      fileName: '',
      file: {
        error: '',
      },
    };
    events.toggle();
  };
  events.done = () => {
    if (!data.file) {
      data.file.error = 'File is missing.';
      return;
    }
    data.file.error = '';
    const nameParts = data.file.value.name.split('.');
    nameParts[0] = data.fileName.split('.')[0];
    const fileName = nameParts.join('.');
    events.callback({ fileName, file: data.file.value });
    data = {
      fileName: '',
      file: {
        error: '',
      },
    };
    events.toggle();
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
    value={data.fileName}
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
      invalid={data.file.error !== '' ? true : false}
      invalidText={data.file.error}
      on:add={event => {
        data.file.value = event.detail[0];
        if (data.fileName === '') {
          data.fileName = data.file.value.name
            .split('.')[0]
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/_/g, '-')
            .replace(/[^0-9a-z---]+/g, '');
        }
      }} />
  </div>
</Modal>
