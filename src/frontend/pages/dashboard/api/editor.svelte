<script>
  import { onMount } from 'svelte';
  import {
    axios,
    fatch,
    templateStore,
    functionStore,
    keyStore,
  } from '../../../config.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import { CodeSnippet, ToggleSmall } from 'carbon-components-svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import Button from '../../../components/global/button.svelte';
  import KeyModal from '../../../components/global/modal/name-desc.svelte';
  import AddRouteConfigModal from '../../../components/api/modals/add-route-config.svelte';
  import RouteConfig from '../../../components/api/route-config.svelte';
  import StringUtil from '../../../string-util.js';

  let templates = [];
  let functions = [];
  let keys = [];
  let keySelected;
  let keyConfig;
  let usedTemplatesForKey = [];
  let addKeyModalEvents = {};
  let editKeyModalEvents = {};
  let addRouteConfigModalEvents = { callback: addKeyConfig };
  let blockButtonEvents = {
    set: value => {
      if (
        confirm('Are you sure you want to change Block status of this key?')
      ) {
        keySelected.blocked = value;
      } else {
        blockButtonEvents.force(keySelected.blocked ? true : false);
      }
    },
  };
  let routeSecurityEvents = {};

  templateStore.subscribe(value => {
    templates = value;
  });
  functionStore.subscribe(value => {
    functions = value;
  });
  keyStore.subscribe(value => {
    keys = value;
    if (keys.length > 0 && !keySelected) {
      keySelected = keys[0];
      setKeyConfig();
    }
  });

  function setKeyConfig() {
    keyConfig = {
      templates: keySelected.access.templates.map(e => {
        return {
          type: 'Template',
          _id: {
            value: e._id,
            errors: '',
          },
          method: {
            error: '',
            values: e.methods,
          },
          entry: {
            methods: e.entry.methods,
          },
        };
      }),
      functions: keySelected.access.functions.map(e => {
        return {
          type: 'Function',
          error: '',
          name: e,
        };
      }),
    };
    usedTemplatesForKey = keyConfig.templates.map(e => {
      return e._id.value;
    });
  }
  function addKeyConfig(type) {
    if (type === 'Template') {
      keySelected.access.templates = [
        ...keySelected.access.templates,
        {
          _id: '',
          methods: [],
          entry: {
            methods: [],
          },
        },
      ];
    } else {
      keySelected.access.functions = [
        ...keySelected.access.functions,
        {
          name: '',
        },
      ];
    }
  }
  function deleteConfig(type, index) {
    if (type === 'Function') {
      keySelected.access.functions = keySelected.access.functions.filter(
        (e, i) => {
          if (i === index) {
            return false;
          }
          return true;
        },
      );
    } else if (type === 'Template') {
      keySelected.access.templates = keySelected.access.templates.filter(
        (e, i) => {
          if (i === index) {
            return false;
          }
          return true;
        },
      );
    }
  }
  function selectKey(item) {
    keySelected = keys.find(e => e._id === item._id);
    setKeyConfig();
  }
  async function addKey(data) {
    const result = await axios.send({
      url: '/key',
      method: 'POST',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    keyStore.update(value => [...keys, result.response.data.key]);
    keySelected = result.response.data.key;
    setKeyConfig();
  }
  async function deleteKey() {
    if (confirm('Are you sure you want to delete this Key?')) {
      const result = await axios.send({
        url: `/key/${keySelected._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success('Keye deleted successfully!');
      keyStore.update(value => keys.filter(e => e._id !== keySelected._id));
      if (keys.length > 0) {
        keySelected = keys[0];
        setKeyConfig();
      } else {
        keySelected = undefined;
        keyConfig = undefined;
      }
    }
  }
  async function updateKey(key) {
    let k;
    if (!key) {
      k = keySelected;
    } else {
      k = key;
    }
    const result = await axios.send({
      url: '/key',
      method: 'PUT',
      data: k,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    keyStore.update(value =>
      keys.map(key => {
        if (key._id === k._id) {
          return k;
        }
        return key;
      }),
    );
    keySelected = result.response.data.key;
    simplePopup.success('Key updated successfully.');
  }

  onMount(() => {
    fatch();
    if (keys.length > 0 && !keySelected) {
      keySelected = keys[0];
      setKeyConfig();
    }
  });
</script>

<style type="text/scss">
  .update {
    margin-left: auto;
  }

  .general {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
  }

  .config {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 20px;
  }

  .router .no-config {
    text-align: center;
    font-size: 14pt;
    color: var(--c-gray-dark);
    margin-bottom: 20px;
  }

  .router .add-config {
    text-align: center;
  }
</style>

<Layout>
  <ManagerLayout
    onlySlot={true}
    items={keys}
    itemSelected={keySelected}
    menuConfig={{ heading: 'KEYS', buttonLabel: 'Add new Key' }}
    on:addNewItem={event => {
      if (event.eventPhase === 0) {
        addKeyModalEvents.toggle();
      }
    }}
    on:itemClicked={event => {
      if (event.eventPhase === 0) {
        selectKey(event.detail);
      }
    }}
    on:edit={event => {
      if (event.eventPhase === 0) {
        editKeyModalEvents.set(keySelected.name, keySelected.desc);
        editKeyModalEvents.toggle();
      }
    }}
    on:delete={event => {
      if (event.eventPhase === 0) {
        deleteKey();
      }
    }}>
    {#if keySelected}
      <div class="update">
        <Button
          icon="fas fa-check"
          on:click={() => {
            updateKey();
          }}>
          Update
        </Button>
      </div>
      <h4>General</h4>
      <div class="general mt-20">
        <p>
          <CodeSnippet code={keySelected.secret} />
        </p>
        {#if keySelected.blocked === true}
          <ToggleSmall
            toggled={true}
            labelText="Blocked"
            labelA="No"
            labelB="Yes"
            on:change={event => {
              keySelected.blocked = event.target.checked;
            }} />
        {:else}
          <ToggleSmall
            toggled={false}
            labelText="Blocked"
            labelA="No"
            labelB="Yes"
            on:change={event => {
              keySelected.blocked = event.target.checked;
            }} />
        {/if}
      </div>
      <h4 class="mt-50">Router Configuration</h4>
      <div class="router mt-20">
        {#if keySelected.access.templates.length === 0 && keySelected.access.functions.length === 0}
          <div class="no-config">
            This Key is not configured. No resources can be accessed using it!
          </div>
        {:else}
          <div class="config">
            {#each keySelected.access.templates as config, i}
              <RouteConfig
                configType="Template"
                {templates}
                {functions}
                {config}
                on:remove={() => {
                  deleteConfig('Template', i);
                }} />
            {/each}
            {#each keySelected.access.functions as config, i}
              <RouteConfig
                configType="Function"
                {templates}
                {functions}
                {config}
                on:remove={() => {
                  deleteConfig('Function', i);
                }} />
            {/each}
          </div>
        {/if}
        <div class="add-config mt-20">
          <Button
            icon="fas fa-plus"
            kind="ghost"
            on:click={() => {
              addRouteConfigModalEvents.toggle();
            }}>
            Add Configuration
          </Button>
        </div>
      </div>
    {/if}
  </ManagerLayout>
  <!-- <div class="editor">
    <Menu events={menu.events} config={menu.config} />
    <div class="content">
      {#if keySelected}
        <div class="title">
          <div>{StringUtil.prettyName(keySelected.name)}</div>
          <div class="edit">
            <button class="btn" on:click={editKeyModalEvents.toggle}>
              <div class="fas fa-edit icon" />
            </button>
          </div>
        </div>
        {#if keySelected.desc === ''}
          <div class="desc">This Key does not have description.</div>
        {:else}
          <div class="desc">{keySelected.desc}</div>
        {/if}
        <div class="update">
          <button
            class="btn-border btn-blue-c btn-blue-br"
            on:click={() => {
              updateKey();
            }}>
            <div class="fas fa-trash icon" />
            <div class="text">Update</div>
          </button>
        </div>
        <div class="data">
          <h3>General Information</h3>
          <div class="general">
            <div class="key-value">
              <div class="label">
                <span class="fas fa-id-card icon" />
                <span>Identification number</span>
              </div>
              <div class="value">{keySelected._id}</div>
            </div>
            <div class="key-value">
              <div class="label">
                <span class="fas fa-key icon" />
                <span>Key Secret</span>
              </div>
              <div class="value">{keySelected.secret}</div>
            </div>
            <div class="key-value">
              <div class="label">
                <span class="fas fa-ban icon" />
                <span>Block access</span>
              </div>
              <div class="value">
                <OnOff
                  init={keySelected.blocked}
                  stateMessages={{ true: 'Blocked', false: 'Access Allowed' }}
                  events={blockButtonEvents} />
              </div>
            </div>
          </div>
          <h3>Router Configuration</h3>
          <div class="route">
            {#if keySelected.access.templates.length === 0 && keySelected.access.functions.length === 0}
              <div class="no-config">
                This Key is not configured. No resources can be accessed using
                it!
              </div>
            {/if}
            {#each keySelected.access.templates as config, i}
              <RouteConfig
                configType="Template"
                {templates}
                {functions}
                {config}
                events={{ remove: () => {
                    deleteConfig('Template', i);
                  } }} />
            {/each}
            {#each keySelected.access.functions as config, i}
              <RouteConfig
                configType="Function"
                {templates}
                {functions}
                {config}
                events={{ remove: () => {
                    deleteConfig('Function', i);
                  } }} />
            {/each}
            <div class="add">
              <button
                class="btn-fill btn-blue-bg"
                on:click={addRouteConfigModalEvents.toggle}>
                <div class="fas fa-plus icon" />
                <div class="text">Add New Configuration</div>
              </button>
            </div>
          </div>
        </div>
        <div class="actions">
          <button
            class="btn-border btn-red-c btn-red-br delete"
            on:click={deleteKey}>
            <div class="fas fa-trash icon" />
            <div class="text">Delete</div>
          </button>
        </div>
      {:else}
        <div class="props">
          <div class="no-props">
            <div class="message">No Keys in Database yet</div>
            <div class="desc">Add your first Key</div>
            <button
              class="btn-fill btn-blue-bg action"
              on:click={addKeyModalEvents.toggle}>
              <div class="fa fa-plus icon" />
              <div class="text">Add New Key</div>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div> -->
</Layout>
<KeyModal
  title="Add new Key"
  events={addKeyModalEvents}
  on:done={event => {
    if (event.eventPhase === 0) {
      addKey({
        name: event.detail.name,
        desc: event.detail.desc,
        blocked: false,
        access: {
          global: {
            methods: [],
          },
          templates: [],
          functions: [],
        },
      });
    }
  }} />
<AddRouteConfigModal events={addRouteConfigModalEvents} />
{#if keySelected}
  <KeyModal
    title="Edit Key"
    events={editKeyModalEvents}
    on:done={event => {
      if (event.eventPhase === 0) {
        const key = JSON.parse(JSON.stringify(keySelected));
        key.name = event.detail.name;
        key.desc = event.detail.desc;
        updateKey(key);
      }
    }} />
{/if}
