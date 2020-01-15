<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/layout/layout.svelte';
  import Menu from '../../../components/menu.svelte';
  import AddGroupModal from '../../../components/group/modals/add-group.svelte';
  import EditGroupModal from '../../../components/group/modals/edit-group.svelte';
  import AddPropModal from '../../../components/modals/add-prop.svelte';
  import EditPropModal from '../../../components/modals/edit-prop.svelte';
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
  let menuEvents = { openGroup, addGroupModalEvents };

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
        changes
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
  <div class="editor">
    <Menu
      events={{ clicked: openGroup, addNewItem: () => {
          addGroupModalEvents.toggle();
        } }}
      config={{ heading: 'GROUPS', buttonLabel: 'Add New Group', items: groups, itemSelected: groupSelected }} />
    <div class="content">
      {#if groupSelected}
        <div class="heading">
          <div class="title">{StringUtil.prettyName(groupSelected.name)}</div>
          <button
            class="btn edit"
            on:click={() => {
              editGroupModalEvents.toggle();
            }}>
            <div class="fa fa-edit icon" />
          </button>
        </div>
        <div class="desc">
          {#if groupSelected.desc === ''}
            This Group does not have description.
          {:else}{groupSelected.desc}{/if}
        </div>
        <div class="props">
          {#if groupSelected.props.length > 0}
            <div class="heading">
              <div class="prop-count">
                {groupSelected.props.length} properties in this Group
              </div>
              <button
                class="btn-border btn-blue-br btn-blue-c add"
                on:click={addPropModalEvents.toggle}>
                <div class="fa fa-plus icon" />
                <div class="text">Add Property</div>
              </button>
            </div>
            <div class="values">
              {#each groupSelected.props as prop, i}
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
                      <button
                        class="btn btn-green-c"
                        on:click={() => {
                          groupSelected = groups.find(e => e._id === prop.value._id);
                        }}>
                        <div class="fas fa-link icon" />
                        <div class="text">
                          {StringUtil.prettyName(groups.find(e => e._id === prop.value._id).name)}
                        </div>
                      </button>
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
          on:click={deleteGroup}>
          <div class="fa fa-trash icon" />
          <div class="text">Delete</div>
        </button>
      {:else}
        <div class="props">
          <div class="no-props">
            <div class="message">No Groups in Database yet</div>
            <div class="desc">Add your first Group</div>
            <button
              class="btn-fill btn-blue-bg action"
              on:click={addGroupModalEvents.toggle}>
              <div class="fa fa-plus icon" />
              <div class="text">Add new Group</div>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
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
