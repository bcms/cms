<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import AddPropModal from '../../../components/modals/add-prop.svelte';
  import EditPropModal from '../../../components/modals/edit-prop.svelte';
  import AddWidgetModal from '../../../components/widget/modals/add-widget.svelte';
  import EditWidgetModal from '../../../components/widget/modals/edit-widget.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
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
  }
  async function editWidget(data) {
    data.changes = {
      props: [],
    };
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
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <ManagerLayout
    items={widgets}
    itemSelected={widgetSelected}
    menuConfig={{ heading: 'WIDGETS', buttonLabel: 'Add new Widget' }}
    on:addNewItem={event => {
      if (event.eventPhase === 0) {
        addWidgetModalEvents.toggle();
      }
    }}
    on:itemClicked={event => {
      if (event.eventPhase === 0) {
        widgetSelected = event.detail;
      }
    }}
    on:addProp={event => {
      if (event.eventPhase === 0) {
        addPropModalEvents.toggle();
      }
    }}
    on:delete={event => {
      if (event.eventPhase === 0) {
        deleteWidget();
      }
    }}>
    {#if widgetSelected && widgetSelected.props.length > 0}
      <PropsList
        props={widgetSelected.props}
        {groups}
        on:remove={event => {
          if (event.eventPhase === 0) {
            deleteProp(event.detail.prop, event.detail.i);
          }
        }}
        on:edit={event => {
          if (event.eventPhase === 0) {
            editPropModalEvents.setProp(event.detail.prop, event.detail.i);
            editPropModalEvents.toggle();
          }
        }} />
    {:else}
      <div class="no-props">
        <div class="message">There are no properties yet</div>
        <div class="desc">Add your first to this Template</div>
        <div class="action">
          <Button
            icon={'fas fa-plus'}
            size={'small'}
            on:click={addPropModalEvents.toggle}>
            Add Property
          </Button>
        </div>
      </div>
    {/if}
  </ManagerLayout>
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
