<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import Menu from '../../../components/menu.svelte';
  import OnOff from '../../../components/on-off.svelte';
  import AddKeyModal from '../../../components/api/modals/add-key.svelte';
  import EditKeyModal from '../../../components/api/modals/edit-key.svelte';
  import AddRouteConfigModal from '../../../components/api/modals/add-route-config.svelte';
  import RouteConfig from '../../../components/api/route-config.svelte';
  import StringUtil from '../../../string-util.js';

  export let Store;
  export let axios;

  let templates = [];
  let functions = [];
  let keys = [];
  let keySelected;
  let keyConfig;
  let usedTemplatesForKey = [];
  let menu = {
    events: {
      clicked: selectKey,
      addNewItem: () => {
        addKeyModalEvents.toggle();
      },
    },
    config: {
      heading: 'KEYS',
      buttonLabel: 'Add New Key',
      items: keys,
      itemSelected: keySelected,
    },
  };
  let addKeyModalEvents = { callback: addKey };
  let editKeyModalEvents = { callback: updateKey };
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
    menu.config.itemSelected = keySelected;
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
    keys = [...keys, result.response.data.key];
    menu.config.items = keys;
    keySelected = result.response.data.key;
    menu.config.itemSelected = keySelected;
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
      keys = keys.filter(e => e._id !== keySelected._id);
      if (keys.length > 0) {
        keySelected = keys[0];
        setKeyConfig();
      } else {
        keySelected = undefined;
        keyConfig = undefined;
      }
      menu.config.items = keys;
      menu.config.itemSelected = keySelected;
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
    keys.forEach(key => {
      if (key._id === k._id) {
        key = k;
      }
    });
    keySelected = result.response.data.key;
    menu.config.itemSelected = keySelected;
    menu.config.items = keys;
    simplePopup.success('Key updated successfully.');
  }

  onMount(async () => {
    let result = await axios.send({
      url: '/key/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    keys = result.response.data.keys;
    menu.config.items = keys;
    if (keys.length > 0) {
      keySelected = keys[0];
      setKeyConfig();
      menu.config.itemSelected = keySelected;
    }
    result = await axios.send({
      url: '/template/all/lite',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    templates = result.response.data.templates;
    result = await axios.send({
      url: '/function/all/available',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    functions = result.response.data.functions;
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <div class="editor">
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
            on:click={updateKey}>
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
  </div>
</Layout>
<AddKeyModal events={addKeyModalEvents} />
<AddRouteConfigModal events={addRouteConfigModalEvents} />
{#if keySelected}
  <EditKeyModal
    events={editKeyModalEvents}
    key={JSON.parse(JSON.stringify(keySelected))} />
{/if}
