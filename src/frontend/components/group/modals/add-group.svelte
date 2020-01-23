<script>
  import {
    TextInput,
    TextArea,
  } from 'carbon-components-svelte';
  import Modal from '../../modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';

  export let events;

  let data = {
    name: {
      value: '',
      error: '',
    },
    desc: '',
  };

  function handleNameInput(event) {
    const value = event.value
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
    data.name.value = value;
    event.value = value;
  }

  events.cancel = () => {
    data = {
      name: {
        value: '',
        error: '',
      },
      desc: {
        value: '',
        error: '',
      },
    };
    events.toggle();
  };
  events.done = async () => {
    if (data.name.value === '') {
      data.name.error = 'Name input cannot be empty.';
      return;
    }
    data.name.error = '';
    events.toggle();
    if (events.callback) {
      events.callback({
        name: data.name.value,
        desc: data.desc.value,
      });
    }
    data = {
      name: {
        value: '',
        error: '',
      },
      desc: {
        value: '',
        error: '',
      },
    };
  };
</script>

<Modal heading={{title: "Create new Group"}} {events}>
  <TextInput
    labelText="Name"
    invalid={data.name.error !== '' ? true : false}
    invalidText={data.name.error}
    value={data.name.value}
    placeholder="- Name -"
    on:input={event => {
      handleNameInput(event.explicitOriginalTarget);
    }} />
  <TextArea
    cols="500"
    labelText="Description"
    placeholder="- Description -"
    on:input={event => {
      data.desc = event.target.value;
    }} />
</Modal>
