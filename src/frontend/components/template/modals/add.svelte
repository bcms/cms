<script>
  import { createEventDispatcher } from 'svelte';
  import {
    TextInput,
    TextArea,
    Select,
    SelectItem,
  } from 'carbon-components-svelte';
  import Modal from '../../global/modal/modal.svelte';

  export let events;

  const dispatch = createEventDispatcher();
  let data = {
    name: {
      value: '',
      error: '',
    },
    type: 'RICH_CONTENT',
    desc: '',
    entryTemplate: [],
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
</script>

<Modal
  heading={{ title: 'Create new Template' }}
  {events}
  on:cancel={event => {
    if (event.eventPhase === 0) {
      data = { name: { value: '', error: '' }, type: 'RICH_CONTENT', desc: '', entryTemplate: [] };
      events.toggle();
    }
  }}
  on:done={event => {
    if (event.eventPhase === 0) {
      if (data.name.value.trim() === '') {
        data.name.error = 'Name input cannot be empty.';
        return;
      }
      data.name.error = '';
      events.callback({
        name: data.name.value,
        desc: data.desc,
        type: data.type,
        entryTemplate: data.entryTemplate,
      });
      data = { name: { value: '', error: '' }, type: 'RICH_CONTENT', desc: '', entryTemplate: [] };
      events.toggle();
    }
  }}>
  <TextInput
    labelText="Name"
    invalid={data.name.error !== '' ? true : false}
    invalidText={data.name.error}
    value={data.name.value}
    placeholder="- Name -"
    on:input={event => {
      handleNameInput(event.target);
    }} />
  <!-- <Select
    labelText="Select type"
    selected="DATA_MODEL"
    on:change={event => {
      if (event.eventPhase === 0) {
        data.type = event.detail;
      }
    }}>
    <SelectItem value="DATA_MODEL" text="Data Model" />
    <SelectItem value="RICH_CONTENT" text="Rich Content" />
  </Select> -->
  <div class="mt-20" />
  <TextArea
    cols="500"
    labelText="Description"
    placeholder="- Description -"
    on:input={event => {
      data.desc = event.target.value;
    }} />
</Modal>
