<script>
  import {createEventDispatcher} from 'svelte';
  import OverflowMenu from '../global/overflow-menu.svelte';
  import OverflowMenuItem from '../global/overflow-menu-item.svelte';

  export { className as class };
  export let entries = [];
  export let lng = 'en';
  export let templatePolicy;

  const dispatch = createEventDispatcher();
  let className = '';
</script>

<style lang="scss">
  .entry-list table {
    width: 100%;
  }

  .entry-list table .header {
    background-color: var(--c-gray-light);
    text-align: left;
    font-size: 12pt;
    font-weight: bold;
  }

  .entry-list table .header th {
    padding: 5px 7px;
  }

  .entry-list table .row {
    border-bottom: 1px solid var(--c-gray-light);
  }

  .entry-list table .row td {
    padding: 3px 7px;
  }

  .entry-list table .row td {
    font-size: 12pt;
  }

  .entry-list table .row .actions {
    display: flex;
  }

  .entry-list table .row .actions .menu {
    margin-left: auto;
  }
</style>

<div class="{className} entry-list">
  <table>
    <tr class="header">
      <th>
        <span class="m-auto-0">ID</span>
      </th>
      <th>Created At</th>
      <th>Updated At</th>
      <th>Title</th>
      <th>Description</th>
      <th />
    </tr>
    {#each entries as entry}
      <tr class="row">
        <td>{entry._id}</td>
        <td>
          {new Date(entry.createdAt).toLocaleDateString()}
          <br />
          {new Date(entry.createdAt).toLocaleTimeString()}
        </td>
        <td>
          {new Date(entry.updatedAt).toLocaleDateString()}
          <br />
          {new Date(entry.updatedAt).toLocaleTimeString()}
        </td>
        {#if entry.content.find(e => e.lng === lng)}
          {#each entry.content.find(e => e.lng === lng).props as prop}
            {#if prop.type === 'QUILL'}
              {#if prop.value.heading.title !== ''}
                <td class="title">{prop.value.heading.title}</td>
                <td class="desc">{prop.value.heading.desc}</td>
              {:else}
                <td class="title">Not available</td>
                <td class="desc">
                  This Entry is not available in '{lng}' language.
                </td>
              {/if}
            {/if}
          {/each}
        {:else}
          <td class="title">Not available</td>
          <td class="desc">This Entry is not available in '{lng}' language.</td>
        {/if}
        <td class="actions">
          <div class="menu">
            <OverflowMenu position="right">
              <OverflowMenuItem
                text="Data Model"
                on:click={() => {
                  dispatch('data', JSON.stringify(entry, null, '  '));
                }} />
              {#if templatePolicy && templatePolicy.put === true}
                <OverflowMenuItem
                  text="Edit"
                  on:click={() => {
                    dispatch('edit', entry);
                  }} />
              {/if}
              {#if templatePolicy && templatePolicy.delete === true}
                <OverflowMenuItem
                  danger={true}
                  text="Delete"
                  on:click={() => {
                    dispatch('delete', entry);
                  }} />
              {/if}
            </OverflowMenu>
          </div>
        </td>
      </tr>
    {/each}
  </table>
</div>
