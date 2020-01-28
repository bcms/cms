<script>
  import { onMount } from 'svelte';
  import {
    TextInput,
    ToggleSmall,
    Select,
    SelectItem,
  } from 'carbon-components-svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import Modal from '../modal.svelte';
  import MultiAdd from '../multi-add.svelte';
  import OnOff from '../on-off.svelte';
  import StringUtil from '../../string-util.js';

  // export let callback;
  export let events;
  export let groups;
  export let usedPropNames;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: `Add new Property`,
    toggle: '',
  };
  let propTypes = [
    {
      name: 'STRING',
      desc: 'Any character array value',
    },
    {
      name: 'NUMBER',
      desc: 'Any Integer, Float, Double...',
    },
    {
      name: 'DATE',
      desc: 'Date in milliseconds',
    },
    {
      name: 'ENUMERATION',
      desc: 'List of choices',
    },
    {
      name: 'BOOLEAN',
      desc: 'Yes or no, true or false, 1 or 0',
    },
    {
      name: 'ARRAY',
      desc: 'Sequence of elements.',
    },
    {
      name: 'GROUP_POINTER',
      desc: 'Implement properties of other Group.',
    },
  ];
  let data = {
    type: {
      value: '',
      error: '',
    },
    name: {
      value: '',
      error: '',
    },
    required: false,
  };
  let view = 1;
  let enumInputOptions = {
    getList: () => {},
    clear: () => {},
  };

  function selectType(p) {
    view = 2;
    data.type.value = p.name;
    switch (data.type.value) {
      case 'ENUMERATION':
        {
          data.value = {
            list: [],
            selected: '',
          };
        }
        break;
      case 'GROUP_POINTER':
        {
          data.value = {
            _id: '',
            props: [],
            selected: {
              value: '',
              error: '',
            },
          };
        }
        break;
      case 'STRING':
        {
          data.value = '';
        }
        break;
      case 'NUMBER':
        {
          data.value = 0;
        }
        break;
      case 'DATE':
        {
          data.value = 0;
        }
        break;
      case 'BOOLEAN':
        {
          data.value = false;
        }
        break;
      case 'ARRAY':
        {
          data.type.value = 'STRING_ARRAY';
          data.value = {
            error: '',
            value: [],
          };
        }
        break;
    }
  }
  function handleNameInput(event) {
    const value = event.value
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
    data.name.value = value;
    event.value = value;
  }
  function handleGroupPointer(event) {
    const group = groups.find(e => e._id === event.detail);
    data.value = {
      _id: group._id,
      props: group.props,
      selected: {
        error: '',
        selected: event.detail,
      },
    };
  }
  function handleGroupPointerForArray(event) {
    const group = groups.find(e => e._id === event.detail);
    data.value.value = {
      _id: group._id,
      props: group.props,
      array: [],
    };
  }
  function handleArray(event) {
    // const parts = data.type.value.split('_');
    data.type.value = event.detail;
    if (data.type.value === 'GROUP_POINTER_ARRAY') {
      data.value = {
        error: '',
        value: {
          _id: '',
          props: [],
          array: [],
        },
      };
    } else {
      data.value = {
        error: '',
        value: [],
      };
    }
  }

  events.cancel = () => {
    events.toggle();
    setTimeout(() => {
      data = {
        type: {
          value: '',
          error: '',
        },
        name: {
          value: '',
          error: '',
        },
        required: false,
      };
      view = 1;
    }, 800);
  };
  events.done = () => {
    if (view === 1) {
      data.type.error = 'Please select type of propserty.';
      return;
    }
    if (data.name.value === '') {
      data.name.error = 'Input cannot be empty.';
      return;
    }
    data.name.error = '';
    if (data.type.value === 'GROUP_POINTER') {
      if (data.value.selected.value === '') {
        data.value.selected.error = 'You need to select a Group.';
        return;
      }
      data.value.selected.error = '';
    }
    const propWithSameName = usedPropNames.find(e => e === data.name.value);
    if (propWithSameName) {
      data.name.error = `Property with name '${data.name.value}' already exist.`;
      return;
    }
    data.name.error = '';
    if (data.type.value === 'ENUMERATION') {
      data.value.items = enumInputOptions.getList();
      enumInputOptions.clear();
    }
    if (data.type.value === 'GROUP_POINTER_ARRAY') {
      if (data.value.value._id === '') {
        data.value.error = 'Please select Group Pointer.';
        return;
      }
      data.value.error = '';
    }
    let value = data.value;
    if (data.type.value.indexOf('_ARRAY') !== -1) {
      value = data.value.value;
    }
    events.toggle();
    setTimeout(() => {
      data = {
        type: {
          value: '',
          error: '',
        },
        name: {
          value: '',
          error: '',
        },
        required: false,
      };
      view = 1;
    }, 800);
    events.callback({
      name: data.name.value,
      type: data.type.value,
      required: data.required,
      value,
    });
  };
</script>

<style type="text/scss">
  @import './add-prop.scss';
</style>

<Modal heading={modalHeading} {events}>
  {#if view === 1}
    {#if data.type.error !== ''}
      <div style="font-size: 8pt; color: var(--c-error); margin: 5px 0;">
        <span class="fa fa-exclamation" />
        <span style="margin-left: 5px;">{data.type.error}</span>
      </div>
    {/if}
    <div class="select-type">
      {#each propTypes as propType}
        {#if propType.name === 'GROUP_POINTER'}
          {#if groups.length > 0}
            <button
              class="type-btn"
              on:click={() => {
                selectType(propType);
              }}>
              <div class="icon">
                <img
                  src="/assets/ics/template/types/{propType.name}.png"
                  alt="NF" />
              </div>
              <div class="name">{StringUtil.prettyName(propType.name)}</div>
              <div class="desc">{propType.desc}</div>
              <div class="fa fa-edit edit" />
            </button>
          {/if}
        {:else}
          <button
            class="type-btn"
            on:click={() => {
              selectType(propType);
            }}>
            <div class="icon">
              <img
                src="/assets/ics/template/types/{propType.name}.png"
                alt="NF" />
            </div>
            <div class="name">{StringUtil.prettyName(propType.name)}</div>
            <div class="desc">{propType.desc}</div>
            <div class="fa fa-edit edit" />
          </button>
        {/if}
      {/each}
    </div>
  {:else if view === 2}
    <TextInput
      labelText="Name"
      invalid={data.name.error !== '' ? true : false}
      invalidText={data.name.error}
      value={data.name.value}
      on:input={event => {
        console.log('here');
        handleNameInput(event.target);
      }} />
    {#if data.type.value === 'ENUMERATION'}
      <MultiAdd label="Enumaretions" options={enumInputOptions} />
    {:else if data.type.value === 'GROUP_POINTER'}
      <Select
        labelText="Select a Group"
        selected=""
        invalid={data.value.selected.error !== '' ? true : false}
        invalidText={data.value.selected.error}
        on:change={event => {
          if (event.eventPhase === 0) {
            handleGroupPointer(event);
          }
        }}>
        <SelectItem value="" text="- Unspecified -" />
        {#each groups as group}
          <SelectItem
            value={group._id}
            text={StringUtil.prettyName(group.name)} />
        {/each}
      </Select>
    {:else if data.type.value.indexOf('_ARRAY') !== -1}
      <Select
        labelText="Select an Array Type"
        selected="STRING_ARRAY"
        on:change={event => {
          if (event.eventPhase === 0) {
            handleArray(event);
          }
        }}>
        <SelectItem value="STRING_ARRAY" text="String Array" />
        <SelectItem value="NUMBER_ARRAY" text="Number Array" />
        <SelectItem value="BOOLEAN_ARRAY" text="Boolean Array" />
        {#if groups.length > 0}
          <SelectItem value="GROUP_POINTER_ARRAY" text="Group Pointer Array" />
        {/if}
      </Select>
      {#if data.type.value === 'GROUP_POINTER_ARRAY'}
        <Select
          labelText="Select a Group"
          selected=""
          invalid={data.value.error !== '' ? true : false}
          invalidText={data.value.error}
          on:change={event => {
            if (event.eventPhase === 0) {
              handleGroupPointerForArray(event);
            }
          }}>
          <SelectItem value="" text="- Unspecified -" />
          {#each groups as group}
            <SelectItem
              value={group._id}
              text={StringUtil.prettyName(group.name)} />
          {/each}
        </Select>
      {/if}
    {/if}
    <ToggleSmall
      labelText="Required"
      labelA="No"
      labelB="Yes"
      toggled={false}
      on:change={event => {
        data.required = event.target.checked;
      }} />
  {/if}
</Modal>
