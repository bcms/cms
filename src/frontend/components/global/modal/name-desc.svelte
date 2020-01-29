<script>
  import { afterUpdate, createEventDispatcher } from 'svelte';
  import Modal from './modal.svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import { TextInput, TextArea } from 'carbon-components-svelte';

  export let title;
  export let events;
  export let nameEncoding = '-';
  export let name;
  export let desc;

  const dispatch = createEventDispatcher();
  let data = {
    name: {
      value: '',
      error: '',
    },
    desc: {
      value: '',
      error: '',
    },
  };

  function handleNameInput(event) {
    let value;
    switch (nameEncoding) {
      case '_':
        {
          value = event.value
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/-/g, '_')
            .replace(/[^0-9a-z_-_]+/g, '');
        }
        break;
      case '-':
        {
          value = event.value
            .toLowerCase()
            .replace(/ /g, '_')
            .replace(/_/g, '-')
            .replace(/[^0-9a-z---]+/g, '');
        }
        break;
      default: {
        value = event.value;
      }
    }
    data.name.value = value;
    event.value = value;
  }
  function cancel() {
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
    dispatch('cancel');
  }
  function done() {
    if (data.name.value.replace(/ /g, '') === '') {
      data.name.error = 'Name input cannot be empty.';
      return;
    }
    data.name.error = '';
    events.toggle();
    dispatch('done', {
      name: data.name.value,
      desc: data.desc.value,
    });
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
  }

  if (name) {
    handleNameInput({
      value: `${name}`,
    });
  }
  if (desc) {
    data.desc.value = `${desc}`;
  }

  events.set = (name, desc) => {
    if (name) {
      // handleNameInput({value: data.name.value});
      data.name.value = name;
    }
    if (desc) {
      data.desc.value = desc;
    }
  };
</script>

<Modal heading={{ title }} {events} {events} on:cancel={cancel} on:done={done}>
  <TextInput
    labelText="Name"
    placeholder="- Name -"
    invalid={data.name.error !== '' ? true : false}
    invalidText={data.name.error}
    value={data.name.value}
    on:input={event => {
      handleNameInput(event.target);
    }} />
  <TextArea
    labelText="Description"
    placeholder="- Description -"
    helperText="Optional input"
    value={data.desc.value}
    on:input={event => {
      data.desc.value = event.target.value;
    }} />
</Modal>
