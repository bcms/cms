<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import Modal from '../modal.svelte';
  import MultiAdd from '../multi-add.svelte';
  import OnOff from '../on-off.svelte';
  import StringUtil from '../../string-util.js';

  // export let callback;
  export let events;
  export let groups;
  export let usedPropNames;
  export let selectedGroupId;

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
    // {
    //   name: 'ARRAY',
    //   desc: 'Sequence of elements.',
    // },
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
          data.value = [];
        }
        break;
    }
  }
  function handleNameInput(event) {
    const value = event.currentTarget.value
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
    data.name.value = value;
    event.currentTarget.value = value;
  }
  function handleGroupPointer(event) {
    const group = groups.find(e => e._id === event.target.value);
    data.value = {
      _id: group._id,
      props: group.props,
    };
  }
  function handleGroupPointerForArray(event) {
    const group = groups.find(e => e._id === event.target.value);
    data.value.value = {
      _id: group._id,
      props: group.props,
      array: [],
    };
  }
  function handleArray(event) {
    const parts = data.type.value.split('_');
    data.type.value = `${event.target.value}${parts[parts.length - 1]}`;
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

<style>
  .select-type {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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
    background-color: #00000000;
    font-size: 10pt;
  }

  .type-btn:hover {
    background-color: #f3f3f3;
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
    color: #919bae;
  }

  .type-btn .edit {
    margin: auto 0 auto auto;
  }

  .type-btn:hover .edit {
    color: var(--c-primary);
  }

  .v2 {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
</style>

<Modal heading={modalHeading} {events}>
  {#if view === 1}
    {#if data.type.error !== ''}
      <div style="font-size: 8pt; color: red; margin: 5px 0;">
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
    <div class="v2">
      <div class="key-value">
        <div class="label">
          Name
          {#if data.name.error !== ''}
            <div style="font-size: 8pt; color: red; margin-top: 5px;">
              <span class="fa fa-exclamation" />
              <span style="margin-left: 5px;">{data.name.error}</span>
            </div>
          {/if}
        </div>
        <div class="value">
          <input class="input" on:keyup={handleNameInput} />
        </div>
      </div>
      {#if data.type.value === 'ENUMERATION'}
        <div class="key-value">
          <div class="label">Options</div>
          <div class="value">
            <MultiAdd options={enumInputOptions} />
          </div>
        </div>
      {:else if data.type.value === 'GROUP_POINTER'}
        <div class="key-value">
          <div class="label">Select Group</div>
          <div class="value">
            <select class="select" on:change={handleGroupPointer}>
              {#each groups as group}
                {#if !selectedGroupId || selectedGroupId !== group._id}
                  <option value={group._id}>
                    {StringUtil.prettyName(group.name)}
                  </option>
                {/if}
              {/each}
              <option value="" selected>- Unspecified -</option>
            </select>
          </div>
        </div>
      {:else if data.type.value.indexOf('_ARRAY') !== -1}
        <div class="key-value">
          <div class="label">Select Array Type</div>
          <div class="value">
            <select class="select" on:change={handleArray}>
              <option value="STRING_" selected>String</option>
              <option value="NUMBER_">Number</option>
              <option value="BOOLEAN_">Boolean</option>
              <option value="GROUP_POINTER_">Group Pointer</option>
            </select>
          </div>
        </div>
        {#if data.type.value === 'GROUP_POINTER_ARRAY'}
          <div class="key-value">
            <div class="label">
              Select Group
              {#if data.value.error !== ''}
                <div style="font-size: 8pt; color: red; margin-top: 5px;">
                  <span class="fa fa-exclamation" />
                  <span style="margin-left: 5px;">{data.value.error}</span>
                </div>
              {/if}
            </div>
            <div class="value">
              <select class="select" on:change={handleGroupPointerForArray}>
                {#each groups as group}
                  {#if !selectedGroupId || selectedGroupId !== group._id}
                    <option value={group._id}>
                      {StringUtil.prettyName(group.name)}
                    </option>
                  {/if}
                {/each}
                <option value="" selected>- Unspecified -</option>
              </select>
            </div>
          </div>
        {/if}
      {/if}
      <div class="key-value">
        <div class="label">Required</div>
        <div class="value">
          <OnOff
            init={false}
            events={{ set: value => {
                data.required = value;
              } }} />
        </div>
      </div>
    </div>
  {/if}
</Modal>
