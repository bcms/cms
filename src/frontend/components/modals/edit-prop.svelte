<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import Modal from '../modal.svelte';
  import MultiAdd from '../multi-add.svelte';
  import OnOff from '../on-off.svelte';
  import StringUtil from '../../string-util.js';

  export let events;
  export let groups;
  export let usedPropNames;
  export let selectedGroupId;

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
    const value = event.currentTarget.value
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
    prop.name.value = value;
    event.currentTarget.value = value;
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

<style>
  .v2 {
    display: grid;
    grid-template-columns: auto;
    grid-gap: 10px;
  }
</style>

<Modal heading={modalHeading} {events}>
  <div class="v2">
    <div class="key-value">
      <div class="label">
        Name
        {#if prop.name.error !== ''}
          <div style="font-size: 8pt; color: var(--c-error); margin-top: 5px;">
            <span class="fa fa-exclamation" />
            <span style="margin-left: 5px;">{prop.name.error}</span>
          </div>
        {/if}
      </div>
      <div class="value">
        <input
          class="input"
          on:keyup={handleNameInput}
          value={prop.name.value} />
      </div>
    </div>
    {#if prop.type === 'ENUMERATION'}
      <div class="key-value">
        <div class="label">Options</div>
        <div class="value">
          <MultiAdd options={enumInputOptions} />
        </div>
      </div>
    {:else if prop.type === 'GROUP_POINTER'}
      <div class="key-value">
        <div class="label">Select Group</div>
        <div class="value">
          <select class="select" bind:value={prop.value}>
            {#each groups as group}
              {#if !selectedGroupId || selectedGroupId !== group._id}
                {#if prop.value === group._id}
                  <option value={group._id} selected>
                    {StringUtil.prettyName(group.name)}
                  </option>
                {:else}
                  <option value={group._id}>
                    {StringUtil.prettyName(group.name)}
                  </option>
                {/if}
              {/if}
            {/each}
          </select>
        </div>
      </div>
    {/if}
    <div class="key-value">
      <div class="label">Required</div>
      <div class="value">
        <OnOff
          init={prop.required}
          events={{ set: value => {
              prop.required = value;
            } }} />
      </div>
    </div>
  </div>
</Modal>
