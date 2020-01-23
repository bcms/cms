<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import ManagerLayout from '../../../components/layout/manager-content.svelte';
  import AddGroupModal from '../../../components/group/modals/add-group.svelte';
  import EditGroupModal from '../../../components/group/modals/edit-group.svelte';
  import AddPropModal from '../../../components/modals/add-prop.svelte';
  import EditPropModal from '../../../components/modals/edit-prop.svelte';
  import PropsList from '../../../components/prop/props-list.svelte';
  import Button from '../../../components/global/button.svelte';
  import StringUtil from '../../../string-util.js';
  import UrlQueries from '../../../url-queries.js';

  export let axios;
  export let Store;

  let groups = [];
  let groupSelected;
  let addGroupModalEvents = {
    toggle: () => {},
    callback: addGroup,
  };
  let editGroupModalEvents = { callback: editGroup };
  let addPropModalEvents = { callback: addProp };
  let editPropModalEvents = { callback: editProp };

  function openGroup(group) {
    groupSelected = group;
  }
  async function addGroup(data) {
    data.changes = {
      props: [],
    };
    const result = await axios.send({
      url: '/group',
      method: 'POST',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    groups = [...groups, result.response.data.group];
    groupSelected = result.response.data.group;
  }
  async function editGroup(data) {
    data.changes = {
      props: [],
    };
    const result = await axios.send({
      url: '/group',
      method: 'PUT',
      data,
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    groupSelected = result.response.data.group;
    groups = groups.map(group => {
      if (group._id === result.response.data.group._id) {
        return result.response.data.group;
      }
      return group;
    });
  }
  async function deleteGroup() {
    if (
      confirm(
        'Are you sure you want to delete the Group?\n\n' +
          'THIS ACTION IS IRREVERSABLE!\n' +
          'ALL POINTERS TO THIS GROUP WILL BE DELETED!',
      )
    ) {
      const result = await axios.send({
        url: `/group/${groupSelected._id}`,
        method: 'DELETE',
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        return;
      }
      groups = groups.filter(e => e._id !== groupSelected._id);
      if (groups.length > 0) {
        groupSelected = groups[0];
      } else {
        groupSelected = undefined;
      }
    }
  }
  async function addProp(data) {
    const result = await axios.send({
      url: '/group',
      method: 'PUT',
      data: {
        _id: groupSelected._id,
        props: [...groupSelected.props, data],
        changes: {
          props: [],
        },
      },
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    const group = result.response.data.group;
    groupSelected = group;
    groups.forEach(g => {
      if (g._id === group._id) {
        g = group;
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
      url: '/group',
      method: 'PUT',
      data: {
        _id: groupSelected._id,
        props: groupSelected.props.map(e => {
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
    const group = result.response.data.group;
    groupSelected = group;
    groups.forEach(g => {
      if (g._id === group._id) {
        g = group;
      }
    });
  }
  async function deleteProp(prop, i) {
    const result = await axios.send({
      url: '/group',
      method: 'PUT',
      data: {
        _id: groupSelected._id,
        props: [...groupSelected.props.filter(p => p.name !== prop.name)],
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
    groupSelected.props = groupSelected.props.filter(p => p.name !== prop.name);
    groups.forEach(e => {
      if (e._id === groupSelected._id) {
        e.props = groupSelected.props;
      }
    });
  }

  onMount(async () => {
    const result = await axios.send({
      url: '/group/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    groups = result.response.data.groups;
    const queries = UrlQueries.get();
    if (queries.gid) {
      groupSelected = groups.find(e => e._id === queries.gid);
    }
    if (!groupSelected && groups.length > 0) {
      groupSelected = groups[0];
    }
  });
</script>

<style type="text/scss">
  @import './editor.scss';
</style>

<Layout {Store} {axios}>
  <ManagerLayout
    items={groups}
    itemSelected={groupSelected}
    menuConfig={{ heading: 'GROUPS', buttonLabel: 'Add new Group' }}
    on:addNewItem={event => {
      if (event.eventPhase === 0) {
        addGroupModalEvents.toggle();
      }
    }}
    on:itemClicked={event => {
      if (event.eventPhase === 0) {
        openGroup(event.detail);
      }
    }}
    on:addProp={event => {
      if (event.eventPhase === 0) {
        addPropModalEvents.toggle();
      }
    }}
    on:delete={event => {
      if (event.eventPhase === 0) {
        deleteGroup();
      }
    }}>
    {#if groupSelected && groupSelected.props.length > 0}
      <PropsList
        props={groupSelected.props}
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
<AddGroupModal events={addGroupModalEvents} />
{#if groupSelected}
  <AddPropModal
    selectedGroupId={groupSelected._id}
    usedPropNames={groupSelected.props.map(e => {
      return e.name;
    })}
    {groups}
    events={addPropModalEvents} />
  <EditPropModal
    selectedGroupId={groupSelected._id}
    usedPropNames={groupSelected.props.map(e => {
      return e.name;
    })}
    {groups}
    events={editPropModalEvents} />
  <EditGroupModal events={editGroupModalEvents} group={groupSelected} />
{/if}
