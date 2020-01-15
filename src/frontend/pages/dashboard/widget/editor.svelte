<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import Menu from '../../../components/menu.svelte';
  import AddPropModal from '../../../components/modals/add-prop.svelte';
  import EditPropModal from '../../../components/modals/edit-prop.svelte';
  import AddWidgetModal from '../../../components/widget/modals/add-widget.svelte';
  import EditWidgetModal from '../../../components/widget/modals/edit-widget.svelte';
  import StringUtil from '../../../string-util.js';
  import UrlQueries from '../../../url-queries.js';

  export let axios;
  export let Store;

  let groups = [];
  let widgets = [];
  let widgetSelected;
  let addWidgetModalEvents = { callback: addWidget };
  let editWidgetModalEvents = { callback: editWidget };
  let addPropModalEvents = { callback: addProp };
  let editPropModalEvents = { callback: editProp };
  let menu = {
    config: {
      heading: 'WIDGETS',
      buttonLabel: 'Add New Widget',
      items: widgets,
      itemSelected: widgetSelected,
    },
    events: {
      clicked: item => {
        widgetSelected = item;
        menu.config.itemSelected = item;
      },
      addNewItem: () => {
        addWidgetModalEvents.toggle();
      },
    },
  };

  async function addWidget(data) {
    const result = await axios.send({
      url: '/widget',
      method: 'POST',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Widget added successfully!');
    widgets = [...widgets, result.response.data.widget];
    widgetSelected = result.response.data.widget;
    menu.config.items = widgets;
    menu.config.itemSelected = widgetSelected;
  }
  async function editWidget(data) {
    const result = await axios.send({
      url: '/widget',
      method: 'PUT',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Group updated successfully!');
    widgetSelected = result.response.data.widget;
    widgets = widgets.map(widget => {
      if (widget._id === result.response.data.widget._id) {
        return result.response.data.widget;
      }
      return widget;
    });
    menu.config.items = widgets;
    menu.config.itemSelected = widgetSelected;
  }
  async function deleteWidget() {
    if (confirm('Are you sure you want to delete the Widget?\n\n')) {
      const result = await axios.send({
        url: `/widget/${widgetSelected._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      simplePopup.success('Group deleted successfully!');
      widgets = widgets.filter(e => e._id !== widgetSelected._id);
      if (widgets.length > 0) {
        widgetSelected = widgets[0];
      } else {
        widgetSelected = undefined;
      }
      menu.config.items = widgets;
      menu.config.itemSelected = widgetSelected;
    }
  }
  async function addProp(data) {
    const result = await axios.send({
      url: '/widget',
      method: 'PUT',
      data: {
        _id: widgetSelected._id,
        props: [...widgetSelected.props, data],
        changes: {
          props: [],
        },
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Group updated successfully.');
    const widget = result.response.data.widget;
    widgetSelected = widget;
    widgets.forEach(e => {
      if (e._id === widget._id) {
        e = widget;
      }
    });
  }
  async function editProp(originalName, data) {
    const changes = {
      props: [
        {
          name: {
            old: originalName,
            new: data.name,
          },
          required: data.required,
        },
      ],
    };
    const result = await axios.send({
      url: '/widget',
      method: 'PUT',
      data: {
        _id: widgetSelected._id,
        props: widgetSelected.props.map(e => {
          if (e.name === originalName) {
            return data;
          }
          return e;
        }),
        changes,
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    simplePopup.success('Group updated successfully.');
    const widget = result.response.data.widget;
    widgetSelected = widget;
    widgets.forEach(e => {
      if (e._id === widget._id) {
        e = widget;
      }
    });
  }
  async function deleteProp(prop, i) {
    const result = await axios.send({
      url: '/widget',
      method: 'PUT',
      data: {
        _id: widgetSelected._id,
        props: [...widgetSelected.props.filter(p => p.name !== prop.name)],
        changes: {
          props: [
            {
              name: {
                new: '',
                old: prop.name,
              },
              required: prop.required,
              remove: true,
            },
          ],
        },
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    widgetSelected.props = widgetSelected.props.filter(
      p => p.name !== prop.name,
    );
    widgets.forEach(e => {
      if (e._id === widgetSelected._id) {
        e.props = widgetSelected.props;
      }
    });
    simplePopup.success('Property deleted successfully!');
  }

  onMount(async () => {
    let result = await axios.send({
      url: '/group/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    groups = result.response.data.groups;
    result = await axios.send({
      url: '/widget/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    widgets = result.response.data.widgets;
    const queries = UrlQueries.get();
    if (queries.wid) {
      widgetSelected = widgets.find(e => e._id === queries.wid);
    }
    if (!widgetSelected && widgets.length > 0) {
      widgetSelected = widgets[0];
    }
    menu.config.items = widgets;
    menu.config.itemSelected = widgetSelected;
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <div class="editor">
    <Menu events={menu.events} config={menu.config} />
    <div class="content">
      {#if widgetSelected}
        <div class="heading">
          <div class="title">{StringUtil.prettyName(widgetSelected.name)}</div>
          <button
            class="btn edit"
            on:click={() => {
              editWidgetModalEvents.toggle();
            }}>
            <div class="fa fa-edit icon" />
          </button>
        </div>
        <div class="desc">
          {#if widgetSelected.desc === ''}
            This Widget does not have description.
          {:else}{widgetSelected.desc}{/if}
        </div>
        <div class="props">
          {#if widgetSelected.props.length > 0}
            <div class="heading">
              <div class="prop-count">
                {widgetSelected.props.length} properties in this Group
              </div>
              <button
                class="btn-border btn-blue-br btn-blue-c add"
                on:click={addPropModalEvents.toggle}>
                <div class="fa fa-plus icon" />
                <div class="text">Add Property</div>
              </button>
            </div>
            <div class="values">
              {#each widgetSelected.props as prop, i}
                <div class="prop">
                  <div class="img">
                    <img
                      src="/assets/ics/template/types/{prop.type}.png"
                      alt="NF" />
                  </div>
                  <div class="name">{StringUtil.prettyName(prop.name)}</div>
                  <div class="type">
                    <div class="value">{StringUtil.prettyName(prop.type)}</div>
                    {#if prop.type === 'GROUP_POINTER'}
                      <div class="fas fa-long-arrow-alt-right group-pointer" />
                      <a
                        class="btn btn-green-c"
                        href="/dashboard/group/editor?gid={prop.value._id}">
                        <div class="fas fa-link icon" />
                        <div class="text">
                          {StringUtil.prettyName(groups.find(e => e._id === prop.value._id).name)}
                        </div>
                      </a>
                    {/if}
                  </div>
                  {#if prop.required === true}
                    <div class="fa fa-lock required" />
                  {:else}
                    <div class="fa fa-unlock required" />
                  {/if}
                  <div class="action">
                    <button
                      class="fa fa-edit"
                      on:click={() => {
                        editPropModalEvents.setProp(prop, i);
                        editPropModalEvents.toggle();
                      }} />
                  </div>
                  <div class="action">
                    <button
                      class="fa fa-trash"
                      on:click={() => {
                        deleteProp(prop, i);
                      }} />
                  </div>
                </div>
              {/each}
            </div>
            <button
              class="btn-border btn-blue-c btn-blue-br action"
              on:click={addPropModalEvents.toggle}>
              <div class="fa fa-plus icon" />
              <div class="text">Add Property</div>
            </button>
          {:else}
            <div class="no-props">
              <div class="message">There are no properties yet</div>
              <div class="desc">Add your first to this Group</div>
              <button
                class="btn-fill btn-blue-bg action"
                on:click={addPropModalEvents.toggle}>
                <div class="fa fa-plus icon" />
                <div class="text">Add Property</div>
              </button>
            </div>
          {/if}
        </div>
        <button
          class="btn-border btn-red-c btn-red-br delete"
          on:click={deleteWidget}>
          <div class="fa fa-trash icon" />
          <div class="text">Delete</div>
        </button>
      {:else}
        <div class="props">
          <div class="no-props">
            <div class="message">No Widgets in Database yet</div>
            <div class="desc">Add your first Widget</div>
            <button
              class="btn-fill btn-blue-bg action"
              on:click={addWidgetModalEvents.toggle}>
              <div class="fa fa-plus icon" />
              <div class="text">Add new Widget</div>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</Layout>

<AddWidgetModal events={addWidgetModalEvents} />
{#if widgetSelected}
  <AddPropModal
    selectedGroupId={undefined}
    usedPropNames={widgetSelected.props.map(e => {
      return e.name;
    })}
    {groups}
    events={addPropModalEvents} />
  <EditPropModal
    selectedGroupId={undefined}
    usedPropNames={widgetSelected.props.map(e => {
      return e.name;
    })}
    {groups}
    events={editPropModalEvents} />
  <EditWidgetModal events={editWidgetModalEvents} widget={widgetSelected} />
{/if}
