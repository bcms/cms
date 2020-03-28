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
  import CodeSnippet from '../../../components/global/code-snippet.svelte';
  import ToggleSmall from '../../../components/global/toggle/small.svelte';
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
      console.log(keySelected);
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
      console.log(keySelected);
    }
  });
</script>

<style type="text/scss">
  .update {
    margin-left: auto;
  }

  .general {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 370px));
    grid-gap: 20px;
  }

  .config {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 370px));
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
        <CodeSnippet code={keySelected.secret} secret={true} />
        <ToggleSmall
          toggled={keySelected.blocked}
          labelText="Blocked"
          labelA="No"
          labelB="Yes"
          on:change={event => {
            if (event.eventPhase === 0) {
              keySelected.blocked = event.detail;
            }
          }} />
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
