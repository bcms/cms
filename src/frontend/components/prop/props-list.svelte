<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Link } from 'svelte-routing';
  import Button from '../global/button.svelte';
  import OverflowMenu from '../global/overflow-menu.svelte';
  import OverflowMenuItem from '../global/overflow-menu-item.svelte';
  import StringUtil from '../../string-util.js';

  export let groups;
  export let props;

  const dispatch = createEventDispatcher();
</script>

<style lang="scss">
  .prop-list-wrapper table {
    width: 100%;
  }

  .prop-list-wrapper table .header {
    background-color: var(--c-gray-light);
    text-align: left;
    font-size: 12pt;
    font-weight: bold;
  }

  .prop-list-wrapper table .header th {
    padding: 5px 7px;
  }

  .prop-list-wrapper table .row {
    border-bottom: 1px solid var(--c-gray-light);
  }

  .prop-list-wrapper table .row td {
    padding: 3px 7px;
  }

  .prop-list-wrapper table .row .lock {
    display: flex;
    color: var(--c-gray);
  }

  .prop-list-wrapper table .row .lock span {
    margin: auto;
  }

  .prop-list-wrapper table .row td {
    font-size: 12pt;
  }

  .prop-list-wrapper table .row .actions {
    display: flex;
  }

  .prop-list-wrapper table .row .actions .menu {
    margin-left: auto;
  }
</style>

<div class="prop-list-wrapper">
  <table>
    <tr class="header">
      <th />
      <th>Name</th>
      <th>Type</th>
      <th />
    </tr>
    {#each props as prop, i}
      <tr class="row">
        <td class="lock">
          <span class="fas fa-{prop.required === true ? 'lock' : 'unlock'}" />
        </td>
        <td>{StringUtil.prettyName(prop.name)}</td>
        <td>
          {StringUtil.prettyName(prop.type)}
          {#if prop.type === 'GROUP_POINTER' || prop.type === 'GROUP_POINTER_ARRAY'}
            &nbsp;
            <span class="fas fa-arrow-alt" />
            &nbsp;
            <Link to="/dashboard/group/editor?gid={prop.value._id}">
              <span class="fas fa-link" />
              &nbsp; {StringUtil.prettyName(groups.find(e => e._id === prop.value._id).name)}
            </Link>
          {/if}
        </td>
        <td class="actions">
          <div class="menu">
            {#if prop.default !== true}
              <OverflowMenu position="right">
                <OverflowMenuItem
                  text="Move Up"
                  on:click={() => {
                    dispatch('moveUp', { prop, i });
                  }} />
                <OverflowMenuItem
                  text="Move Down"
                  on:click={() => {
                    dispatch('moveDown', { prop, i });
                  }} />
                <OverflowMenuItem
                  text="Edit"
                  on:click={() => {
                    dispatch('edit', { prop, i });
                  }} />
                <OverflowMenuItem
                  danger={true}
                  text="Remove"
                  on:click={() => {
                    dispatch('remove', { prop, i });
                  }} />
              </OverflowMenu>
            {/if}
          </div>
        </td>
      </tr>
    {/each}
  </table>
</div>
