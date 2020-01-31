<script>
  import { groupStore, fatch } from '../../../config.svelte';
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import ManagerLayout from '../../../components/global/manager-content.svelte';
  import GroupModal from '../../../components/global/modal/name-desc.svelte';
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
  let addGroupModalEvents = {};
  let editGroupModalEvents = {};
  let addPropModalEvents = { callback: addProp };
  let editPropModalEvents = { callback: editProp };

  groupStore.subscribe(value => {
    groups = value;
    if (!groupSelected && groups.length > 0) {
      groupSelected = groups[0];
    }
  });

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
    groupStore.update(value => [...groups, result.response.data.group]);
    // groups = [...groups, result.response.data.group];
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
    groupStore.update(value =>
      groups.map(group => {
        if (group._id === result.response.data.group._id) {
          return result.response.data.group;
        }
        return group;
      }),
    );
    // groups = groups.map(group => {
    //   if (group._id === result.response.data.group._id) {
    //     return result.response.data.group;
    //   }
    //   return group;
    // });
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
      groupStore.update(value =>
        groups.filter(e => e._id !== groupSelected._id),
      );
      // groups = groups.filter(e => e._id !== groupSelected._id);
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
    groupStore.update(value =>
      groups.map(g => {
        if (g._id === group._id) {
          return group;
        }
        return g;
      }),
    );
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
    groupStore.update(value =>
      groups.map(g => {
        if (g._id === group._id) {
          return group;
        }
        return g;
      }),
    );
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
    groupStore.update(value =>
      groups.map(e => {
        if (e._id === groupSelected._id) {
          return groupSelected;
        }
        return e;
      }),
    );
    // groups.forEach(e => {
    //   if (e._id === groupSelected._id) {
    //     e.props = groupSelected.props;
    //   }
    // });
  }

  onMount(async () => {
    fatch();
    if (!groupSelected && groups.length > 0) {
      groupSelected = groups[0];
    }
  });
</script>

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
    on:edit={event => {
      if (event.eventPhase === 0) {
        editGroupModalEvents.set(groupSelected.name, groupSelected.desc);
        editGroupModalEvents.toggle();
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
<GroupModal
  title="Add new Group"
  nameEncoding="_"
  events={addGroupModalEvents}
  on:done={event => {
    if (event.eventPhase === 0) {
      addGroup({ name: event.detail.name, desc: event.detail.desc });
    }
  }} />
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
  <GroupModal
    title="Edit Group"
    nameEncoding="_"
    events={editGroupModalEvents}
    on:done={event => {
      if (event.eventPhase === 0) {
        const data = event.detail;
        const group = JSON.parse(JSON.stringify(groupSelected));
        group.name = data.name;
        group.desc = data.desc;
        editGroup(group);
      }
    }} />
{/if}
