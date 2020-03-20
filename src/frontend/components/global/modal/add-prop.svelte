<script>
  import { createEventDispatcher } from 'svelte';
  import {
    TextInput,
    ToggleSmall,
    Select,
    SelectItem,
  } from 'carbon-components-svelte';
  import { templateStore } from '../../../config.svelte';
  import { simplePopup } from '../../simple-popup.svelte';
  import Modal from './modal.svelte';
  import MultiAdd from '../multi-add.svelte';
  import StringUtil from '../../../string-util.js';

  export let events;
  export let groups;
  export let usedPropNames;

  const dispatch = createEventDispatcher();
  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: `Add new Property`,
    toggle: '',
  };
  let templates = [];
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
      desc: 'Implement properties of a Group.',
    },
    {
      name: 'ENTRY_POINTER',
      desc: 'Points to specified Entry in a Template.',
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

  templateStore.subscribe(value => {
    templates = value;
  });

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
      case 'ENTRY_POINTER': {
        data.value = {
          error: '',
          templateId: '',
          entryId: '',
          displayProp: {
            value: 'main_title',
            error: '',
          },
        };
      }
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
    } else if (data.type.value === 'ENTRY_POINTER_ARRAY') {
      data.value = {
        error: '',
        value: {
          templateId: {
            value: '',
            error: '',
          },
          entryIds: [],
          displayProp: {
            value: '',
            error: '',
          },
        },
      };
    } else {
      data.value = {
        error: '',
        value: [],
      };
    }
  }

  function cancel() {
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
      dispatch('cancel');
    }, 800);
  }
  function done() {
    if (view === 1) {
      data.type.error = 'Please select type of propserty.';
      return;
    }
    if (data.name.value === '') {
      data.name.error = 'Input cannot be empty.';
      return;
    }
    data.name.error = '';
    const propWithSameName = usedPropNames.find(e => e === data.name.value);
    if (propWithSameName) {
      data.name.error = `Property with name '${data.name.value}' already exist.`;
      return;
    }
    data.name.error = '';
    let value = data.value;
    if (data.type.value.indexOf('_ARRAY') !== -1) {
      value = data.value.value;
    }
    switch (data.type.value) {
      case 'GROUP_POINTER':
        {
          if (data.value.selected.value === '') {
            data.value.selected.error = 'You need to select a Group.';
            return;
          }
          data.value.selected.error = '';
        }
        break;
      case 'ENUMERATION':
        {
          data.value.items = enumInputOptions.getList();
          enumInputOptions.clear();
        }
        break;
      case 'GROUP_POINTER_ARRAY':
        {
          if (data.value.value._id === '') {
            data.value.error = 'Please select Group Pointer.';
            return;
          }
          data.value.error = '';
        }
        break;
      case 'ENTRY_POINTER_ARRAY':
        {
          if (data.value.value.templateId.value.replace(/ /g, '') === '') {
            data.value.value.templateId.error = 'Template must be selected.';
            return;
          }
          data.value.value.templateId.error = '';
          if (data.value.value.displayProp.value.replace(/ /g, '') === '') {
            data.value.value.displayProp.error = 'Template must be selected.';
            return;
          }
          data.value.value.displayProp.error = '';
          value = {
            templateId: data.value.value.templateId.value,
            entryIds: [],
            displayProp: data.value.value.displayProp.value,
          };
        }
        break;
      case 'ENTRY_POINTER':
        {
          if (data.value.templateId.replace(/ /g, '') === '') {
            data.value.error = 'Template must be selected.';
            return;
          }
          data.value.error = '';
          if (data.value.displayProp.value.replace(/ /g, '') === '') {
            data.value.displayProp.error = 'Template must be selected.';
            return;
          }
          data.value.displayProp.error = '';
          value = {
            templateId: data.value.templateId,
            entryId: '',
            displayProp: data.value.displayProp.value,
          };
        }
        break;
    }
    // if (data.type.value === 'GROUP_POINTER') {
    //   if (data.value.selected.value === '') {
    //     data.value.selected.error = 'You need to select a Group.';
    //     return;
    //   }
    //   data.value.selected.error = '';
    // }
    // if (data.type.value === 'ENUMERATION') {
    //   data.value.items = enumInputOptions.getList();
    //   enumInputOptions.clear();
    // }
    // if (data.type.value === 'GROUP_POINTER_ARRAY') {
    //   if (data.value.value._id === '') {
    //     data.value.error = 'Please select Group Pointer.';
    //     return;
    //   }
    //   data.value.error = '';
    // }
    // let value = data.value;
    // if (data.type.value.indexOf('_ARRAY') !== -1) {
    //   value = data.value.value;
    // }
    // if (data.type.value === 'ENTRY_POINTER_ARRAY') {
    // }
    // if (data.type.value === 'ENTRY_POINTER') {
    //   if (data.value.templateId.replace(/ /g, '') === '') {
    //     data.value.error = 'Template must be selected.';
    //     return;
    //   }
    //   data.value.error = '';
    //   if (data.value.displayProp.value.replace(/ /g, '') === '') {
    //     data.value.displayProp.error = 'Template must be selected.';
    //     return;
    //   }
    //   data.value.displayProp.error = '';
    //   value = {
    //     templateId: data.value.templateId,
    //     entryId: '',
    //     displayProp: data.value.displayProp.value,
    //   };
    // }
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
    dispatch('done', {
      name: data.name.value,
      type: data.type.value,
      required: data.required,
      value,
    });
  }
</script>

<style type="text/scss">
  .select-type {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 5px;
  }

  .type-btn {
    display: flex;
    padding: 5px;
    border-radius: 2px;
    border-style: solid;
    border-width: 1px;
    border-color: var(--c-placeholder);
    background-color: var(--c-transparent);
    font-size: 10pt;
  }

  .type-btn:hover {
    background-color: var(--c-white-normal);
  }

  .type-btn .icon {
    width: 30px;
    margin: auto 0;
  }

  .type-btn .icon img {
    width: 100%;
  }

  .type-btn .name {
    font-weight: bold;
    margin: auto 0 auto 10px;
  }

  .type-btn .desc {
    margin: auto 0 auto 10px;
    color: var(--c-gray-cold);
  }

  .type-btn .edit {
    margin: auto 0 auto auto;
  }

  .type-btn:hover .edit {
    color: var(--c-primary);
  }
</style>

<Modal heading={modalHeading} {events} on:cancel={cancel} on:done={done}>
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
        handleNameInput(event.target);
      }} />
    {#if data.type.value === 'ENUMERATION'}
      <MultiAdd class="mt-20" label="Enumaretions" options={enumInputOptions} />
    {:else if data.type.value === 'GROUP_POINTER'}
      <Select
        class="mt-20"
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
    {:else if data.type.value.endsWith('_ARRAY') === true}
      <Select
        class="mt-20"
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
        {#if templates.length > 0}
          <SelectItem value="ENTRY_POINTER_ARRAY" text="Entry Pointer Array" />
        {/if}
      </Select>
      {#if data.type.value === 'GROUP_POINTER_ARRAY'}
        <Select
          class="mt-20"
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
      {:else if data.type.value === 'ENTRY_POINTER_ARRAY'}
        <Select
          class="mt-20"
          labelText="Select a Template"
          selected=""
          invalid={data.value.value.templateId.error !== '' ? true : false}
          invalidText={data.value.value.templateId.error}
          on:change={event => {
            if (event.eventPhase === 0) {
              data.value.value.templateId.value = event.detail;
            }
          }}>
          <SelectItem value="" text="- Unspecified -" />
          {#each templates as template}
            <SelectItem
              value={template._id}
              text={StringUtil.prettyName(template.name)} />
          {/each}
        </Select>
        {#if data.value.value.templateId.value !== ''}
          <Select
            class="mt-20"
            labelText="Select a display property"
            selected=""
            invalid={data.value.value.displayProp.error !== '' ? true : false}
            invalidText={data.value.value.displayProp.error}
            on:change={event => {
              if (event.eventPhase === 0) {
                data.value.value.displayProp.value = event.detail;
              }
            }}>
            <SelectItem value="main_title" text="Main Title" />
            {#each templates.find(e => e._id === data.value.value.templateId.value).entryTemplate as prop}
              {#if prop.type === 'STRING'}
                <SelectItem
                  value={prop.name}
                  text={StringUtil.prettyName(prop.name)} />
              {/if}
            {/each}
          </Select>
        {/if}
      {/if}
    {:else if data.type.value === 'ENTRY_POINTER'}
      <Select
        class="mt-20"
        labelText="Select a Template"
        selected=""
        invalid={data.value.error !== '' ? true : false}
        invalidText={data.value.error}
        on:change={event => {
          if (event.eventPhase === 0) {
            data.value.templateId = event.detail;
          }
        }}>
        <SelectItem value="" text="- Unspecified -" />
        {#each templates as template}
          <SelectItem
            value={template._id}
            text={StringUtil.prettyName(template.name)} />
        {/each}
      </Select>
      {#if data.value.templateId !== ''}
        <Select
          class="mt-20"
          labelText="Select a display property"
          selected=""
          invalid={data.value.displayProp.error !== '' ? true : false}
          invalidText={data.value.displayProp.error}
          on:change={event => {
            if (event.eventPhase === 0) {
              data.value.displayProp.value = event.detail;
            }
          }}>
          <SelectItem value="main_title" text="Main Title" />
          {#each templates.find(e => e._id === data.value.templateId).entryTemplate as prop}
            {#if prop.type === 'STRING'}
              <SelectItem
                value={prop.name}
                text={StringUtil.prettyName(prop.name)} />
            {/if}
          {/each}
        </Select>
      {/if}
    {/if}
    <ToggleSmall
      class="mt-20"
      labelText="Required"
      labelA="No"
      labelB="Yes"
      toggled={false}
      on:change={event => {
        data.required = event.target.checked;
      }} />
  {/if}
</Modal>
