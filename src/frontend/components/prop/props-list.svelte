<script>
  import { createEventDispatcher } from 'svelte';
  import { OverflowMenu, OverflowMenuItem } from 'carbon-components-svelte';
  import { Link } from 'svelte-routing';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let groups;
  export let props;

  const dispatch = createEventDispatcher();
</script>

<table class="table w-100p">
  <tr class="table-header">
    <th>
      <p>Required</p>
    </th>
    <th>
      <p>Name</p>
    </th>
    <th>
      <p>Type</p>
    </th>
    <th />
  </tr>
  {#each props as prop, i}
    <tr class="table-row">
      <td>
        <span class="fas fa-{prop.required === true ? 'lock' : 'unlock'}" />
      </td>
      <td>
        <p>{StringUtil.prettyName(prop.name)}</p>
      </td>
      <td>
        <p>
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
        </p>
      </td>
      <td>
        <OverflowMenu>
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
      </td>
    </tr>
  {/each}
</table>
