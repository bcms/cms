<script>
  import { onMount } from 'svelte';
  import { TextInput, ToggleSmall } from 'carbon-components-svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import Modal from '../modal.svelte';
  import MultiAdd from '../multi-add.svelte';
  import OnOff from '../on-off.svelte';
  import StringUtil from '../../string-util.js';

  export let events;
  export let usedPropNames;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: `Edit property`,
    toggle: '',
  };
  let originalName = '';
  let prop = {
    type: '',
    name: {
      value: '',
      error: '',
    },
    required: false,
    value: '',
  };
  let enumInputOptions = {
    init: () => {
      if (prop.type === 'ENUMERATION') {
        return prop.value.items;
      }
      return [];
    },
    getList: () => {},
    clear: () => {},
  };

  function handleNameInput(event) {
    const value = event.value
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
    prop.name.value = value;
    event.value = value;
  }

  events.cancel = () => {
    events.toggle();
    prop = {
      type: '',
      name: {
        value: '',
        error: '',
      },
      required: false,
      value: '',
    };
  };
  events.done = () => {
    if (originalName !== prop.name.value) {
      const propWithSameName = usedPropNames.find(e => e === prop.name.value);
      if (propWithSameName) {
        prop.name.error = `Property with name '${prop.name}' already exist.`;
        return;
      }
      prop.name.error = '';
    }
    if (prop.name.value === '') {
      prop.name.error = 'Name cannot be emptry.';
      return;
    }
    prop.name.error = '';
    if (prop.type === 'ENUMERATION') {
      prop.value.items = enumInputOptions.getList();
      enumInputOptions.clear();
    }
    events.toggle();
    events.callback(originalName, {
      name: prop.name.value,
      type: prop.type,
      required: prop.required,
      value: prop.value,
    });
    prop = {
      type: '',
      name: {
        value: '',
        error: '',
      },
      required: false,
      value: '',
    };
  };
  events.setProp = p => {
    prop = {
      type: p.type,
      name: {
        value: p.name,
        error: '',
      },
      required: p.required,
      value: p.value,
    };
    originalName = '' + p.name;
  };
</script>

<Modal heading={modalHeading} {events}>
  <TextInput
    labelText="Name"
    invalid={prop.name.error !== '' ? true : false}
    invalidText={prop.name.error}
    value={prop.name.value}
    on:input={event => {
      handleNameInput(event.target);
    }} />
  {#if prop.type === 'ENUMERATION'}
    <MultiAdd label="Enumaretions" options={enumInputOptions} />
  {/if}
  {#if prop.required === true}
    <ToggleSmall
      labelText="Required"
      labelA="No"
      labelB="Yes"
      toggled={true}
      on:change={event => {
        prop.required = event.target.checked;
      }} />
  {:else}
    <ToggleSmall
      labelText="Required"
      labelA="No"
      labelB="Yes"
      toggled={false}
      on:change={event => {
        prop.required = event.target.checked;
      }} />
  {/if}
</Modal>
